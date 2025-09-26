# tmp ディレクトリ調査メモ

## 1. 概要

- `tmp/convertTimestampDate.ts`
  - Firestore Timestamp を Date に変換するユーティリティ。Cloudflare Workers 側でも利用価値あり。
- `tmp/firebase.ts`
  - ブラウザ SDK を使った初期化。API キー等がハードコードされており、新アーキテクチャでは **使用禁止**。
- `tmp/firebaseDataType/*`
  - Firestore ドキュメントの構造を表す型がまとまっている。ただし `@/types/...` を参照しており、フロント専用 TypeScript と密結合。
- `tmp/groupDb/*` `tmp/scoutDb/*`
  - フロントエンドから直接 Firestore を叩く実装。Workers 経由で REST API に置き換える必要あり。
- `tmp/sysManager/sysManager.tsx`
  - React コンポーネント。バックエンドには不要なのでフロントへ移動または破棄。
- `tmp/types/backend/*`
  - Firestore とマスターデータの型定義。Workers で再利用する余地あり。

## 2. 課題と対応方針

| 領域                   | 既存コード上の課題                           | 新アーキテクチャでの扱い                                                                                   |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Firebase 初期化        | ブラウザ SDK を使用し API キーが露出         | Cloudflare Workers の `fetch` + Firebase REST API を使用。`tmp/firebase.ts` は削除・封印。                 |
| Timestamp 変換         | Firestore SDK 依存                           | Worker では REST API レスポンスが ISO 文字列。ユーティリティを ISO→Date に一般化。                         |
| 型定義                 | `@` エイリアス依存でフロント専用型と混在     | バックエンド側で完結する型 (`docs/schema/*.ts` 等) を再定義。必要に応じて zod でバリデーション。           |
| グループ/スカウト CRUD | クライアント SDK で直接 Firestore へアクセス | Worker が `/api/groups/*` `/api/scouts/*` を提供し、Firebase REST API を利用。クライアントは Worker 経由。 |
| Master データ          | sessionStorage を参照                        | Cloudflare KV / Durable Object / static asset などに移行。Workers 側でキャッシュ戦略を設計。               |
| SysManager UI          | バックエンドに存在                           | フロントリポジトリへ移動し、Worker からは管理 API のみ提供。                                               |

## 3. Worker 側で用意するべき API

- `/api/groups/current` : Firebase Custom Claims or Firestore `groups/{groupId}` を参照して所属情報・権限を返却。
- `/api/scouts/:id` : スカウト詳細 (進級・技能章・イベント) をまとめて返却。Firestore REST ではサブコレクション取得に追加 call が必要。
- `/api/scouts/:id` (PUT) : Scout 情報更新。`ginosho`, `events`, `grades` をバッチ化し FST REST で書き込み。
- `/api/scouts/search` : groupId + クエリ条件で検索。Workers 上で複合条件を組み立て、結果を統合。必要なら Algolia 等に移行検討。
- `/api/masters/*` : 技能章・進級マスターデータを配信。Workers KV or GitHub raw asset をキャッシュ。
- `/api/users/login` `/api/users/refresh` : Firebase Identity Toolkit をラップし、メール＋パスワード認証とトークンリフレッシュを担当。
- `/api/users/me` (GET/PUT) : ログイン中ユーザーのプロフィール・設定を取得／更新。SaaS 側で保持する通知設定や UI 言語、所属情報のメタデータを Firestore に保存。

## 4. データアクセス方針

1. Worker から Firebase REST (`https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/...`) を使用。
2. 認証済み ID トークンを `Authorization: Bearer` で受け取り、`verifyIdToken` で検証。
3. Firestore REST 呼び出し時は `access_token` (サービスアカウント) ではなく ID トークンベースは不可。Cloudflare から Google サービスへアクセスするため、以下を検討:
   - Google OAuth サービスアカウント + `fetch` でトークン取得 (シークレット管理要)。
   - 代替として Supabase/Convex 等の BaaS へ移行する案も検討。
4. 更新処理は Cloudflare Worker 内で差分を計算し、REST API の `patch` or `commit` エンドポイントを使用。

## 5. 次ステップの提案

1. `tmp` 配下のコードを参照用に保管しつつ、`/docs` に移設した仕様をもとに Worker API 設計を書き起こす。
2. Firebase REST 用のラッパーモジュール (認証トークン取得、ドキュメント CRUD) を作成。
3. ドメイン毎 (`groups`, `scouts`) にリポジトリ層を実装し、フロントには `hc` クライアントを提供。
4. 不要になったブラウザ SDK 依存のファイルを削除 or `legacy/` ディレクトリへ移す。

## 6. API 実装のファイル分割指針

- `src/api/auth/*` : `/api/users/login` `/api/users/refresh` など認証系。ID トークン検証ミドルウェアもここに配置し、`verifyIdToken` を共有化する。
- `src/api/users/*` : ユーザー設定やプロフィールに関するエンドポイント。Firestore の `users/{uid}` ドキュメントを扱う repository を薄くラップする。
- `src/api/groups/*` : 団体関連 (`/api/groups/current` ほか)。
- `src/api/scouts/*` : スカウト詳細・検索・更新。サブリソースごとにファイルを分けて責務を明確化。
- `src/api/masters/*` : マスターデータ提供。KV キャッシュや静的アセット管理をここで担う。
- ルーティングのエントリーポイントでは、上記モジュールを `app.route('/api/users', usersRouter)` のようにマウントして責務ごとに整理する。
