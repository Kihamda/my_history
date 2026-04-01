# アーキテクチャ

## 全体構成

本番構成は 3 つの主要コンポーネントで成り立つ

1. フロントエンド SPA (React 19 + React Router 7)
2. バックエンド API + 静的配信 (Cloudflare Workers + Hono)
3. 静的サイト生成ツール (React SSR)

```
[Browser]
  ↓ HTTPS
[Cloudflare Workers + Hono]
  ├─ /apiv1/*   API (32 エンドポイント)
  ├─ /          Landing HTML (静的生成)
  ├─ /help/*    Help HTML (静的生成)
  ├─ /app/*     SPA (spa.html)
  ├─ /auth/*    SPA (spa.html)
  └─ /god/*     SPA (spa.html)

Firestore ← firebase-rest-firestore (Service Account)
Firebase Auth ← firebase-auth-cloudflare-workers (ID Token 検証)
```

## 実行フロー

### 認証

1. フロントエンドが Firebase Auth でメール/パスワードログイン
2. ID トークンを取得 (`getIdToken`)
3. API 呼び出し時に `Authorization: Bearer <token>` を付与
4. バックエンドが `authorize` ミドルウェアで検証
5. メール認証済みか確認 (`email_verified: true`)
6. `loadUserData` が Firestore のユーザードキュメントを読み込み
7. トークンは 10 分ごとに自動更新

### API 呼び出し

1. Hono ルーターがリクエストを受け取る
2. グローバル CORS ミドルウェア (`IS_DEV` で許可オリジン制御)
3. `firestoreMiddleware` が Firestore クライアントを初期化
4. `authorize` で ID トークンを検証
5. User 操作以外は `loadUserData` が権限情報をコンテキストへ注入
6. ハンドラーが `db()` 経由で Firestore を操作
7. JSON を返却

### 静的配信

1. [staticSiteMarger/](../staticSiteMarger/) が Landing と Help を静的生成
2. `staticSiteMarger/dist/` に出力
3. `frontend/dist/` にコピー (既存の index.html は spa.html に退避)
4. `backend/buildTmp/` にコピー
5. Workers の `ASSETS` バインディングで配信

## 役割分担

### フロントエンド

- React 19 + React Router 7 + Vite (rolldown-vite)
- 画面遷移は React Router で制御
- API クライアントは Hono の型付きクライアント (`hc`)
- 状態管理は Context API + localStorage/sessionStorage

### バックエンド

- Cloudflare Workers 上の Hono
- Firestore は REST API を Service Account で操作
- 認可は `loadUserData` の `memberships` と `shares` を参照
- 入力検証は Zod + `zValidator`

### 静的サイト生成

- React を `renderToString` で SSR して静的 HTML を生成
- Landing (6 セクション) と Help (5 記事) を `template.html` へ埋め込み
- Help は Markdown から `marked` で変換

## 重要な設計メモ

- グループのメンバー情報は Group ドキュメントではなく User ドキュメントに保持
- メンバーシップは `auth.memberships` に `"ROLE;groupId"` 形式で格納
- スカウト共有は User の `auth.shares` に `scoutId` 形式で格納
- ルーティング単位で `/app` `/auth` `/god` は SPA の `spa.html` を返す
- `/` は Landing の `index.html` を返す
