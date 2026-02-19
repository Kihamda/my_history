# アーキテクチャ

## 全体構成

本番構成は 3 つの主要コンポーネントで成り立つ

1. フロントエンド SPA
2. バックエンド API と静的配信
3. 静的サイト生成ツール

```
[Browser]
  ↓ HTTPS
[Cloudflare Workers + Hono]
  ├─ /apiv1/*   API
  ├─ /         Landing HTML
  ├─ /app/*     SPA ルーティング用 HTML
  └─ /auth/*    SPA ルーティング用 HTML

Firestore ← firebase-rest-firestore (Service Account)
Firebase Auth ← firebase-auth-cloudflare-workers (ID Token 検証)
```

## 実行フロー

### 認証

1. フロントエンドが Firebase Auth でログイン
2. ID トークンを取得
3. API 呼び出し時に Authorization: Bearer を付与
4. バックエンドが `authorize` で検証
5. `loadUserData` が Firestore のユーザードキュメントを読み込み

### API 呼び出し

1. Hono ルーターがリクエストを受け取る
2. `firestoreMiddleware` が Firestore クライアントを初期化
3. `authorize` で ID トークンを検証
4. `loadUserData` が権限情報をコンテキストへ注入
5. ハンドラーが Firestore を操作
6. JSON を返却

### 静的配信

1. [staticSiteMarger/](../staticSiteMarger/) が Landing と Help を静的生成
2. 生成物を [frontend/dist/](../frontend/dist/) にコピー
3. さらに [backend/buildTmp/](../backend/buildTmp/) にコピー
4. Workers が `serveStatic` で配信

## 役割分担

### フロントエンド

- React 19 + Vite
- 画面遷移は React Router で制御
- API クライアントは Hono の型付きクライアント

### バックエンド

- Cloudflare Workers 上の Hono
- Firestore は REST API を Service Account で操作
- 認可は `loadUserData` の `memberships` と `shares` を参照

### 静的サイト生成

- React を SSR して静的 HTML を生成
- Landing と Help を同じテンプレートへ埋め込み

## 重要な設計メモ

- グループのメンバー情報は Group ドキュメントではなく User ドキュメントに保持
- スカウト共有は User の `auth.shares` で管理
- ルーティング単位で `/app` と `/auth` を SPA の HTML に固定
