# Rate limit・Firestore競合検知・KV編集履歴設計仕様

更新日：2026-09-07

状態：実装前の設計仕様

実装担当想定：Astra

## 1. 決定事項

この設計では、API負荷制御、同時編集の競合検知、編集履歴を次の三つへ分離する。

- APIの呼び出し制限はCloudflare WorkersのRate Limiting bindingで行う。
- 編集中に元データが更新されたかどうかは、Firestoreの`updateTime`を使う条件付き更新で判定する。
- 競合時は上書きせず、`409 Conflict`と現在のFirestoreデータを返す。
- Workers KVは数か月保持する追記専用の編集履歴としてだけ使用する。
- Workers KVの履歴は、競合判定、認可、現在値、ロック、処理権の正本にしない。
- 既存の`MY_HISTORY_KV_CACHE`はFirebase公開鍵キャッシュ専用とし、編集履歴には再利用しない。

本仕様で「同時編集阻止」と呼ぶ範囲は、古い版を基にした更新による上書きを防ぐ楽観的排他制御である。編集中の利用者を画面上でロックしたり、他利用者の入力をリアルタイム表示したりする機能は含まない。

競合判定の単位はScoutドキュメント全体とする。別々のフィールドを編集した場合でも、同じScoutに先行更新があれば後続更新は409になる。一つの操作で複数ドキュメントを変更する処理は本仕様の対象外とし、必要になった場合はFirestoreの複数文書トランザクションとして別に設計する。

## 2. 目的

- 同じScoutデータを複数人が編集した場合に、後から送信した古い内容で現在値を上書きしない。
- 競合した利用者へ、再編集の基準になる現在のFirestoreデータを返す。
- 成功した編集について、誰が、いつ、どの項目を変更したかを数か月参照できるようにする。
- rate limit、現在データ、編集履歴の障害範囲を分ける。
- KVの結果整合性が通常の編集処理へ影響しない構成にする。

## 3. 非目的

- 編集開始中のデータを排他的にロックすること。
- 自動マージ、共同編集、カーソル共有を実装すること。
- KVの履歴を使ってFirestoreの現在値を復元または判定すること。
- KVの履歴を法令・監査要件に対応する改ざん不能な監査証跡として扱うこと。
- FirestoreとWorkers KVを一つの原子的トランザクションにすること。
- 初期実装で履歴からワンクリック復元すること。
- rate limitをWorkers KVのカウンターで実装すること。

## 4. 現行実装と必要な変更

### 4.1 現行の更新処理

現在のScout更新は次の順で動作する。

```text
ScoutをFirestoreから取得
  → 所属または共有ロールで認可
  → リクエストのdataでScout全体をset
```

`last_Edited`は日単位の文字列であり、同時編集の世代識別には使用できない。また、現在利用している`firebase-rest-firestore` 1.5.0の`DocumentSnapshot`はFirestoreレスポンスの`updateTime`を公開せず、`set()`にも更新時刻のpreconditionがない。

そのため、アプリケーション側で現在値を読んでから比較し、通常の`set()`を呼ぶだけでは不十分である。二つの要求が同じ版を同時に読んだ場合、両方が比較を通過し、後の書き込みが先の書き込みを失わせる。

### 4.2 必須となるFirestore機能

更新処理は、Firestore REST APIのDocument `updateTime`と`currentDocument.updateTime` preconditionを扱える必要がある。

- 読み取り時に、ScoutデータとFirestoreの`updateTime`を取得する。
- クライアントへ`updateTime`を不透明な`revision`として返す。
- 更新要求は、編集開始時の`revision`を`baseRevision`として送る。
- 更新時は`currentDocument.updateTime = baseRevision`を指定する。
- precondition不一致ならFirestoreは更新を行わない。

参考：

- [Firestore DocumentのupdateTime](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents)
- [Firestore document patchとcurrentDocument](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/patch)
- [Firestore Precondition](https://firebase.google.com/docs/firestore/reference/rest/v1beta1/Precondition)

## 5. 全体構成

```text
ブラウザ
  → CORS
  → firestoreMiddleware
  → Firebase IDトークン検証
  → 通常rate limit
  → loadUserData
  → Scout取得（data + revision）
  → 編集
  → PUT（data + baseRevision）
  → 更新対象Scoutを取得して認可
  → Firestore条件付き更新
       ├─ precondition一致
       │    → 更新成功
       │    → 変更差分をKV編集履歴へ追記
       │    → 成功レスポンス
       └─ precondition不一致
            → 現在のScoutを再取得
            → 現在の権限を再確認
            → 409 + 現在データ
```

KVへの追記はFirestore更新成功後に行う。KVの書き込みに失敗しても、成功済みのFirestore更新を再実行またはロールバックしない。

## 6. rate limit仕様

rate limitの設計は、編集競合とKV履歴から独立させる。

| 区分 | 暫定値 | 対象 |
| --- | ---: | --- |
| `general` | 120回/60秒 | 認証に成功したすべての`/apiv1/*` |
| `sensitive` | 20回/60秒 | 他利用者・所属・共有・削除・Godデータに影響する操作 |

- `general`は`authorize`の直後、`loadUserData`より前に置く。
- 判定キーは検証済みFirebase UIDとする。
- Scoutの通常編集は`general`だけを適用する。
- 制限超過時は既存JSON形式のメッセージ、429、`Retry-After: 60`、`Cache-Control: no-store`を返す。
- Workers KVをrate limitカウンターに使用しない。

Rate Limiting bindingはCloudflare拠点ごと・結果整合的であり、設定値は厳密な全世界合計ではない。

参考： [Workers Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

## 7. Scout取得契約

`GET /apiv1/scout/:id`は、現在データに加えて編集用revisionを返す。

```ts
type ScoutResponse = {
  data: ScoutRecord;
  revision: string; // Firestore updateTime。クライアントは解析しない
};
```

- `revision`はFirestoreのRFC 3339形式`updateTime`をそのまま使用する。
- クライアントは`revision`の大小比較や時刻表示を行わず、JavaScriptの`Date`へ変換しない。
- 小数秒の精度と文字列表現を変えず、取得時の値をそのまま更新要求まで保持する。
- React QueryのScoutキャッシュは`data`と`revision`を同じ応答として保持する。
- 共有VIEWを含め、Scoutを閲覧できる利用者へrevisionを返してよい。

## 8. Scout更新契約

### 8.1 リクエスト

```ts
type UpdateScoutRequest = {
  data: ScoutRecordWithoutBelongGroupId;
  baseRevision: string;
};
```

- `baseRevision`は必須とする。
- 最大長とRFC 3339形式をZodで検証する。
- `baseRevision`には編集開始時に取得した値を使用する。サーバーが更新直前に読み直したrevisionで置き換えない。
- `baseRevision`がない旧クライアントの更新は`400`とし、無条件上書きへフォールバックしない。
- `belongGroupId`は従来どおり更新対象外とする。

### 8.2 成功レスポンス

```ts
type UpdateScoutSuccess = {
  message: "Scout updated successfully";
  data: ScoutRecord;
  revision: string;
};
```

更新後のFirestoreレスポンスから新しい`revision`を返し、フロントエンドのキャッシュをこの値へ置き換える。

### 8.3 競合レスポンス

```http
HTTP/1.1 409 Conflict
Content-Type: application/json
Cache-Control: no-store
```

```ts
type UpdateScoutConflict = {
  message: "EDIT_CONFLICT";
  current: {
    data: ScoutRecord;
    revision: string;
  };
};
```

- precondition不一致時にだけ409を返す。
- 認証失敗、認可失敗、入力エラー、Firestore障害など、precondition不一致以外のエラーを409へ変換しない。
- 409を返す前に現在のScoutに対する閲覧権限を再確認する。
- 権限を失っている場合は403を返し、現在データを含めない。
- Scoutが削除されている場合は404を返す。
- 競合時にサーバー側で自動マージまたは自動再試行しない。
- 競合したリクエストの内容をKV履歴へ成功履歴として保存しない。

### 8.4 フロントエンド動作

- 409を通常の汎用エラー表示だけで捨てず、`current`を受け取る。
- 「ほかの編集が保存されました。現在の内容を確認して、もう一度編集してください」と通知する。
- 現在値を表示し、利用者が再編集できる状態へ戻す。
- ローカル入力を現在値へ自動上書きしない。
- 初期実装ではフィールド単位の自動マージUIを作らない。

## 9. Firestore Operator仕様

既存の汎用`get()`と`set()`の挙動は変えず、世代付き取得と条件付き更新をScout Operatorへ追加する。

```ts
type VersionedDocument<T> = {
  data: T;
  updateTime: string;
};

type ConditionalSetResult<T> =
  | { kind: "updated"; current: VersionedDocument<T> }
  | { kind: "conflict" }
  | { kind: "not-found" };
```

想定インターフェース：

```ts
getVersioned(id: string): Promise<VersionedDocument<ScoutRecord> | null>;

setIfVersion(
  id: string,
  value: ScoutRecord,
  expectedUpdateTime: string,
): Promise<ConditionalSetResult<ScoutRecord>>;
```

条件付き更新はFirestore REST APIのpreconditionで一回の書き込みとして実行する。アプリケーション側の事前比較だけで実装完了としない。

現在の依存ライブラリはこの機能を公開していないため、実装前に次のどちらかを選ぶ。

1. `firebase-rest-firestore`の認証・変換機構を再利用できる最小限の拡張方法を確認する。
2. 条件付きScout更新だけを担当する小さなFirestore RESTアダプターを`backend/src/lib/firestore/`へ追加する。

依存パッケージ全体の置き換えや、全コレクションOperatorの同時再設計は行わない。

## 10. KV編集履歴

### 10.1 用途

Workers KVは、成功したScout編集を数か月閲覧するための履歴に限定する。競合判定、保存可否、認可、現在値の組み立てには使わない。

初期対象は`PUT /apiv1/scout/:id`による通常編集だけとする。移管、共有、削除、Group、User、God操作は、必要な履歴内容と閲覧権限が異なるため別途追加する。

### 10.2 namespace

編集履歴専用bindingを追加する。

```text
MY_HISTORY_EDIT_HISTORY
```

- 本番とdevで別のKV namespaceを使用する。
- `MY_HISTORY_KV_CACHE`とは共有しない。
- namespaceの全削除や障害がFirebase公開鍵キャッシュへ影響しないようにする。

### 10.3 保存期間

- 初期TTLは180日とする。
- `expiresAt = createdAt + 15,552,000秒`を初回書き込み時に固定する。
- `KV.put()`には同じ時刻を`expiration`として渡す。
- 読み直しや一覧表示でTTLを延長しない。
- 保持期間を変更しても、既存履歴の期限は一括延長しない。

180日は「数か月」の暫定値であり、実装前に確定する。

### 10.4 キー

```text
edit-history:v1:scout:{scoutId}:{reverseEpochMs}:{revisionHash}
```

- `reverseEpochMs = 9999999999999 - createdAtMs`を13桁の0埋め文字列にする。
- `revisionHash`は更新後のFirestore `updateTime`から決定的に生成する。
- 同じ確定済み更新のKV書き込みを再送しても、同じキーと同じ絶対期限を使用する。
- prefix listで新しい履歴から取得できる順序にする。
- メールアドレス、Firebase token、Scout名、変更内容をキーへ含めない。
- 一つの編集につき新しいキーを作り、既存履歴キーを更新しない。

### 10.5 値

```ts
type ScoutEditHistory = Readonly<{
  version: 1;
  eventId: string; // entityIdとafterRevisionから決定的に生成
  entityType: "scout";
  entityId: string;
  operation: "update";
  actorUidHash: string;
  beforeRevision: string;
  afterRevision: string;
  changes: ReadonlyArray<{
    field: string;
    before: unknown;
    after: unknown;
  }>;
  createdAt: number; // Unix秒
  expiresAt: number; // Unix秒
}>;
```

- `actorUidHash`は環境別秘密鍵によるUIDのHMAC-SHA-256とする。
- `eventId`は`entityId + afterRevision`からHMAC等で決定的に生成し、同じ更新の再記録で履歴を重複させない。
- 編集履歴の表示で利用者名が必要な場合は、閲覧時に現在のUserデータから解決する。KVへメールアドレスを保存しない。
- 変更のないフィールドは`changes`へ含めない。
- `belongGroupId`は通常編集で変更されないため含めない。
- 履歴から現在のScout全体を再構築することは保証しない。
- 差分値に個人情報が含まれ得るため、KV履歴もFirestoreと同等の非公開業務データとして扱う。

### 10.6 書き込み順序と障害

```text
Firestore条件付き更新成功
  → 条件付き更新の応答と更新前データから差分を生成
  → KVへ新規履歴キーをput
  → API成功レスポンス
```

- KV書き込みは`await`し、成功または失敗を確定してから応答する。
- 更新後にScoutを再GETして履歴のafterを作らない。再GETまでに別の編集が入る可能性があるため、条件付き更新が返したDocumentとその`updateTime`を使う。
- KV書き込み失敗時もFirestore更新は成功として返す。
- KV失敗を理由にFirestore更新を再実行しない。
- KV失敗を利用者の再送で埋めようとしない。
- `edit_history_write_failed`を構造化ログへ出し、履歴欠損として監視する。
- Workers KVの編集履歴はベストエフォートであり、KV障害、Worker停止、タイムアウトにより一部欠損し得る。
- 監査上、履歴欠損を許容できない要件へ変わった場合はWorkers KVとの二重書きを継続せず、Firestore内の履歴コレクション等を再設計する。
- 全件保存が必須になった場合は、Firestore更新と同じ原子的コミットでoutboxレコードを作成し、後続処理でKV等へ配送する方式を別途検討する。

### 10.7 KVの整合性

KVは結果整合性であり、更新成功直後の履歴が一覧にまだ表示されない場合がある。キーが存在しないという結果もキャッシュされるため、一覧の不在を編集未実行の証拠にしてはならない。

更新直後の画面表示は更新成功レスポンスの内容を使い、KV一覧への即時反映を待たない。

参考：

- [Workers KVの整合性](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Workers KVの書き込みとexpiration](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)
- [Workers KVの制限](https://developers.cloudflare.com/kv/platform/limits/)

## 11. 履歴一覧API

初期API案：

```http
GET /apiv1/scout/:id/history?cursor=<opaque>&limit=20
```

```ts
type ScoutHistoryResponse = {
  items: ScoutEditHistory[];
  cursor?: string;
  listComplete: boolean;
};
```

- `limit`は1以上50以下、既定20とする。
- cursorはKVが返す値を不透明な文字列として扱う。
- 現在のScoutを取得し、通常のScout閲覧権限を確認してからKVを読む。
- 現在のScoutが削除済みなら、初期実装では履歴も404とする。
- VIEW利用者へ履歴を公開するか、EDIT以上へ限定するかは実装前に確定する。
- KVから取得した値はZodで検証し、壊れた一件があっても無制限に再試行しない。
- 一覧は直近履歴の即時反映を保証しない。

履歴取得も`general` rate limitの対象とする。履歴専用の上限は利用状況を確認してから追加する。

## 12. セキュリティと個人情報

- 競合レスポンスで現在データを返す前に、現在の認可を確認する。
- 過去に権限があったことを示す履歴だけで閲覧を許可しない。
- KV bindingをクライアントへ公開しない。
- 履歴キーとログに生のUID、メールアドレス、tokenを含めない。
- 履歴値へ変更理由などの自由入力項目を追加しない。
- `actorUidHash`生成用秘密鍵はWrangler secretとして環境別に管理する。
- 履歴APIのレスポンスは`Cache-Control: no-store`とする。
- God権限でも履歴の全件横断一覧APIを初期実装では設けない。

## 13. ログと観測

次のイベントを構造化して記録する。

- `rate_limit_denied`
- `rate_limit_unavailable`
- `scout_edit_conflict`
- `edit_history_write_failed`
- `edit_history_entry_invalid`

ログへ含める項目：

- environment
- operationを表す固定ラベル
- HTTP method
- routeを表す固定ラベル
- response status
- Cloudflare colo
- CF-Ray

ログへ含めない項目：

- Authorizationヘッダー
- Firebase token
- 生のUIDまたはメールアドレス
- Scout、Group、Userの本文
- 差分のbeforeとafter

観測する指標は、429率、409率、条件付き更新失敗率、KV履歴書き込み失敗率、履歴APIの不正レコード件数である。

## 14. ファイル変更計画

| ファイル | 変更内容 |
| --- | --- |
| `backend/wrangler.jsonc` | Rate Limiting bindingと履歴専用KV bindingを本番・devへ追加し、環境別HMAC secretを要求する。 |
| `backend/src/apiRotuer.ts` | binding型と通常rate limitを追加する。 |
| `backend/src/lib/rateLimit.ts` | rate limit判定、429/503、ログを共通化する。 |
| `backend/src/lib/firestore/operator.ts` | Scout用の世代付き取得と条件付き更新を追加する。既存Operatorの挙動は維持する。 |
| `backend/src/lib/editHistory.ts` | キー、schema、差分生成、180日expiration、一覧、障害分類を実装する。 |
| `backend/src/scout/handlers/get.ts` | Scoutデータとrevisionを返す。 |
| `backend/src/scout/handlers/update.ts` | `baseRevision`を検証し、条件付き更新、409現在値、成功後のKV履歴追記を行う。 |
| `backend/src/scout/scoutRoute.ts` | 取得・更新・履歴APIの型付きルートを定義する。 |
| `frontend/src/app/scoutDetail/*` | revision保持、更新送信、409時の現在値表示と再編集導線を実装する。 |
| `frontend/src/lib/api/api.ts` | 409本文を呼び出し側で型付き処理できるよう、必要最小限のエラー表現を追加する。 |
| `backend/worker-configuration.d.ts` | `npm run cf-typegen`でbinding型を再生成する。 |
| `docs/api.md` | revision、baseRevision、409、履歴APIを記載する。 |
| `docs/architecture.md` | 条件付き更新とKV追記の責務を記載する。 |
| `docs/data-model.md` | KV編集履歴のschemaと保持期間を記載する。 |
| `docs/security.md` | 履歴の認可、個人情報、保持方針を記載する。 |
| `docs/changelog.md` | APIと挙動の変更を記録する。 |
| `docs/roadmap.md` | 実装後にrate limit、競合、履歴の該当項目を更新する。 |

外部依存の追加やFirestoreクライアント全体の置き換えは、条件付き更新に不可欠と確認されない限り行わない。

## 15. 導入順序

1. Scoutの世代付き取得とFirestore条件付き更新をバックエンドへ実装する。
2. GET・PUT契約と409応答をフロントエンドへ反映する。
3. 同時送信で一件だけが成功し、もう一件が現在値付き409になることを確認する。
4. Rate Limiting bindingを認証後、Userデータ読み込み前へ追加する。
5. 履歴専用KV namespaceとschemaを追加する。
6. Scout更新成功後の追記と履歴一覧APIを追加する。
7. dev環境で競合、履歴遅延、履歴欠損ログ、認可を確認する。
8. ドキュメントを更新し、`work → dev → main`の順で反映する。

競合検知とKV履歴を一つの疑似トランザクションとして実装しない。Firestore更新成功後にKV追記を行う明示的な二段階処理とする。

## 16. 検証

実装時に次を実施する。

```text
backend: npm run typecheck
backend: npm run dry-run
frontend: npm run build
```

dev環境では次を確認する。

- GETでFirestore由来のrevisionが返る。
- 正しいbaseRevisionによる更新が成功し、新しいrevisionが返る。
- 古いbaseRevisionによる更新はFirestoreを書き換えず、現在値付き409になる。
- 同じbaseRevisionを使った二つの同時更新は一件だけ成功する。
- 409前に認可を失った利用者へ現在値を返さない。
- 409後にフロントエンドがローカル入力を自動破棄しない。
- 更新成功一件につき別々のKV履歴キーが作られる。
- 履歴の`beforeRevision`と`afterRevision`が更新結果と一致する。
- 変更されたフィールドだけが履歴へ保存される。
- KV履歴書き込み失敗時にFirestore更新を再実行しない。
- KV履歴の不在や反映遅延がScoutの取得・更新・競合判定へ影響しない。
- 履歴のexpirationと値の`expiresAt`が180日で一致する。
- 履歴の読み取りでTTLが延長されない。
- 履歴一覧が現在のScout閲覧権限を要求する。
- devと本番のrate limit、KV履歴、HMAC鍵が共有されない。
- 静的ファイルとSPA配信はrate limit対象にならない。

## 17. 受入基準

- アプリケーション側のread-compare-setだけで同時編集防止を実装していない。
- Firestoreの`updateTime` preconditionによって競合更新が原子的に拒否される。
- 競合時にFirestoreを更新せず、現在の認可確認後のデータを409で返す。
- フロントエンドが409を通常エラーと区別し、利用者の入力を自動破棄しない。
- KVを競合判定、ロック、現在値、認可に使用していない。
- KV履歴は一編集一キーの追記専用で、既存キーを更新しない。
- KV履歴のTTLが数か月の確定値に設定され、閲覧で延長されない。
- KV履歴書き込み失敗がFirestoreの再更新を引き起こさない。
- 履歴キーとログに生のUID、メールアドレス、tokenを含めていない。
- 既存Firebase公開鍵キャッシュと編集履歴のnamespaceが分離されている。
- 仕様変更に対応するAPI、データモデル、セキュリティ、変更履歴が更新されている。
- backendのtypecheck・dry-runとfrontendのbuildが成功している。

## 18. 実装前に確定する項目

1. 「数か月」を180日で確定するか。
2. 履歴閲覧をVIEWまで許可するか、EDIT以上に限定するか。
3. `changes`へmemoなどの全変更値を保存するか、機微なフィールドを除外するか。
4. 履歴一覧画面を初回実装に含めるか、APIだけを先行するか。
5. 削除済みScoutの履歴をTTLまで閲覧する運用が必要か。
6. KV履歴の欠損が許容される運用履歴か、欠損を許容しない監査履歴か。
7. 条件付きFirestore RESTアダプターを既存ライブラリの内側と外側のどちらに置くか。
8. 既存クライアントを即時に`baseRevision`必須へ移行できるか。

項目6で履歴欠損を許容できない場合、Workers KVは保存先要件を満たさない。Firestore更新と原子的に保存できるFirestore内の履歴コレクション等へ設計を変更する。
