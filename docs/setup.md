# セットアップ

## 前提

- Node.js 18 以上
- Cloudflare アカウント
- Firebase プロジェクト

## バックエンド

### 必須環境変数

Cloudflare Workers の環境変数とシークレットで管理する

- `PROJECT_ID`
- `PUBLIC_JWK_CACHE_KEY`
- `MY_HISTORY_KV_CACHE` (KV Namespace)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (secret)
- `FIREBASE_CLIENT_EMAIL` (secret)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_AUTH_EMULATOR_HOST` (任意)

設定は [backend/wrangler.jsonc](../backend/wrangler.jsonc) を参照

### ローカル開発

```bash
cd backend
npm install
npm run dev
```

## フロントエンド

### 環境変数

- `VITE_API_BASE_URL` または `VITE_API_URL`

### ローカル開発

```bash
cd frontend
npm install
npm run dev
```

## 静的サイト生成

Landing と Help の静的生成を行う

```bash
cd staticSiteMarger
npm install
npm run build
```

生成物は [frontend/dist/](../frontend/dist/) と [backend/buildTmp/](../backend/buildTmp/) に同期される
