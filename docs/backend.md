# バックエンド

最終更新：2026-08-14

バックエンドは Cloudflare Workers 上の Hono アプリケーションです。
JSON API と、ランディングページ、ヘルプ、SPA の静的配信を一つの Worker で処理します。

## エントリーポイント

- `backend/src/index.ts`：エラー処理、CORS、静的配信、API のマウント
- `backend/src/apiRotuer.ts`：Firestore、認証、User データ読み込み、ドメイン別ルート
- `backend/src/client.ts`：フロントエンドが利用する Hono クライアント型

`apiRotuer.ts` は既存の参照に組み込まれたファイル名であるため、単独では改名しません。

## リクエスト処理

`backend/src/index.ts` は、`HTTPException` のステータスとメッセージを JSON に整形します。
それ以外の例外はログへ出力し、`500` と `{ "message": "INTERNAL_SERVER_ERROR" }` を返します。

API では次の順序でミドルウェアを適用します。

1. `firestoreMiddleware` が環境ごとの Firestore クライアントを準備します。
2. `authorize` が Authorization ヘッダーと Firebase ID トークンを検証します。
3. メール確認済みであることを検証します。
4. `POST /apiv1/user/createUser` 以外では `loadUserData` が User ドキュメントを読み込みます。
5. 各ハンドラーが認可を確認して Firestore を操作します。

## API モジュール

| モジュール | ベースパス | 責務 |
| --- | --- | --- |
| `user/` | `/apiv1/user` | 初期登録、プロフィール、所属、招待、共有一覧 |
| `scout/` | `/apiv1/scout` | 検索、作成、表示、更新、削除、移管、共有 |
| `group/` | `/apiv1/group` | グループ設定、メンバー、招待 |
| `god/` | `/apiv1/god` | 全コレクションの管理者向け直接操作 |

実装されている HTTP エンドポイントは、API ルート自身を含めて 39 個です。
完全な一覧は [api.md](api.md) にあります。

## Firestore アクセス

`backend/src/lib/firestore/operator.ts` は、Users、Groups、Scouts の各コレクションを同じインターフェースで扱います。

```ts
db().scouts.get(id)
db().scouts.set(id, value)
db().scouts.del(id)
db().scouts.lis(filters, limit, offset)
```

読み書きの際は Zod スキーマで値を検証します。
`set` は部分更新ではなくドキュメント全体の置換であり、User の配列を変更する処理も読み取り後に全体を書き戻します。

Firestore クライアントは Worker インスタンス内でキャッシュされ、`PROJECT_ID` と `FIREBASE_CLIENT_EMAIL` が変わると作り直されます。

## 入力検証

永続データのスキーマは `backend/src/lib/firestore/schemas.ts` にあります。
API 固有の入力は、各ルートまたはハンドラーで `zValidator` を使って検証します。

ID の共通スキーマは 1 文字以上 100 文字以下の英数字、ハイフン、アンダースコアを許可します。

日付スキーマは空文字または `YYYY-MM-DD` を受け付け、実在する暦日かどうかも確認します。
スカウト新規作成 API の生年月日は別のスキーマを使うため、空文字を許可せず、形式だけを検証します。

## キャッシュ

`MY_HISTORY_KV_CACHE` は Firebase 公開鍵のキャッシュに使います。
User API が所属名と共有スカウト名を組み立てる際は、Worker メモリ内の 5 分 TTL キャッシュを使います。

このメモリキャッシュは Worker インスタンスごとに独立します。

## 静的配信

| パス | 配信内容 |
| --- | --- |
| `/` | `index.html` |
| `/app/*` | `spa.html` |
| `/auth/*` | `spa.html` |
| `/god/*` | `spa.html` |
| その他 | URL と同じパスの ASSETS |

ASSETS バインディングは `backend/buildTmp/` を指します。
`html_handling` は `auto-trailing-slash` です。
