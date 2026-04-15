# セットアップ

## 前提

- Node.js 18 以上
- Cloudflare アカウント
- Firebase プロジェクト (production / development で分離)

## バックエンド

### Wrangler 設定

設定は [backend/wrangler.jsonc](../backend/wrangler.jsonc) を参照

```jsonc
{
  "name": "my-history-backend",
  "main": "src/index.ts",
  "vars": {
    "PROJECT_ID": "my-history-v2",
    "PUBLIC_JWK_CACHE_KEY": "my-history-public-jwk",
  },
  "assets": {
    "directory": "./buildTmp",
    "binding": "ASSETS",
  },
  "kv_namespaces": [
    {
      "binding": "MY_HISTORY_KV_CACHE",
      "id": "<production_kv_id>",
    },
  ],
  "env": {
    "dev": {
      "name": "my-history-dev",
      "vars": {
        "PROJECT_ID": "my-history-dev",
        "PUBLIC_JWK_CACHE_KEY": "my-history-dev-jwk",
        "IS_DEV": "TRUE",
      },
      "kv_namespaces": [
        {
          "binding": "MY_HISTORY_KV_CACHE",
          "id": "<development_kv_id>",
        },
      ],
    },
  },
}
```

> 注意: `binding` 名はコード側参照 (`MY_HISTORY_KV_CACHE`) と一致させる必要があるため、環境ごとに変えるのは `id` のみ

### 環境変数 (Workers)

| 変数名                         | 種類    | 説明                         |
| ------------------------------ | ------- | ---------------------------- |
| `PROJECT_ID`                   | var     | Firebase プロジェクトID      |
| `PUBLIC_JWK_CACHE_KEY`         | var     | KV キャッシュキー            |
| `IS_DEV`                       | var     | 開発モード (`"TRUE"` で有効) |
| `MY_HISTORY_KV_CACHE`          | binding | KV Namespace                 |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | secret  | Service Account JSON         |
| `FIREBASE_CLIENT_EMAIL`        | secret  | SA クライアントメール        |
| `FIREBASE_PROJECT_ID`          | secret  | Firebase プロジェクトID      |

### Secret 設定 (Workers)

production (トップレベル環境)

```bash
cd backend
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
npx wrangler secret put FIREBASE_CLIENT_EMAIL
npx wrangler secret put FIREBASE_PROJECT_ID
```

development (`env.dev`)

```bash
cd backend
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY --env dev
npx wrangler secret put FIREBASE_CLIENT_EMAIL --env dev
npx wrangler secret put FIREBASE_PROJECT_ID --env dev
```

### ローカル開発

```bash
cd backend
npm install
npm run dev
```

### デプロイ

production

```bash
cd backend
npm run deploy
```

development

```bash
cd backend
npx wrangler deploy --env=dev --minify
```

### CI/CD (GitHub Actions)

`.github/workflows/cloudflare-deploy.yml` は 1 つの workflow でブランチにより環境を分岐する

| ブランチ | GitHub Environment | Wrangler コマンド                        |
| -------- | ------------------ | ---------------------------------------- |
| `main`   | `production`       | `npx wrangler deploy --minify`           |
| `dev`    | `development`      | `npx wrangler deploy --env=dev --minify` |

GitHub Environment (`production` / `development`) には次を設定する

- secret: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- secret: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- variable (任意): `VITE_API_URL`

### 型チェック

```bash
cd backend
npm run typecheck
```

## フロントエンド

### 環境変数

| 変数名                              | 説明                              | 例                                  |
| ----------------------------------- | --------------------------------- | ----------------------------------- |
| `VITE_API_URL`                      | API ベース URL                    | `/`                                 |
| `VITE_FIREBASE_API_KEY`             | Firebase API キー                 | `AIza...`                           |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth ドメイン            | `my-history-v2.firebaseapp.com`     |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase プロジェクトID           | `my-history-v2`                     |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage バケット         | `my-history-v2.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID      | `1015...`                           |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID                   | `1:...:web:...`                     |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Firebase Analytics Measurement ID | `G-...`                             |

上記の環境変数一覧をもとに、ローカル用の env ファイルを作成する

- `frontend/.env.development`
- `frontend/.env.production`

### ローカル開発

```bash
cd frontend
npm install
npm run dev
```

### ビルド

production

```bash
cd frontend
npm run build
```

development モードでビルド

```bash
cd frontend
npm run build -- --mode development
```

### Lint

```bash
cd frontend
npm run lint
```

## 静的サイト生成

Landing と Help の静的生成を行う

```bash
cd staticSiteMarger
npm install
npm run build
```

### 出力先

1. `staticSiteMarger/dist/` - 生成物
2. `frontend/dist/` - SPA とマージ (index.html → spa.html に退避)
3. `backend/buildTmp/` - Workers で配信

## 一括ビルド

```bash
# build.bat (Windows)
cd frontend && npm run build
cd ../staticSiteMarger && npm run build
cd ../backend && npm run dev
```

## Firebase 設定

### プロジェクト

- production
  - プロジェクトID: `my-history-v2`
  - 認証ドメイン: `my-history-v2.firebaseapp.com`
- development
  - プロジェクトID: `my-history-dev` (例)
  - 認証ドメイン: `my-history-dev.firebaseapp.com` (例)

### 必要なサービス

1. **Firebase Authentication** - メール/パスワード認証を有効化
2. **Cloud Firestore** - データベース作成
3. **Service Account** - バックエンド用の認証情報

### Service Account 設定

1. Firebase Console → プロジェクト設定 → サービスアカウント
2. 新しい秘密鍵を生成
3. JSON を Cloudflare Workers の Secret に設定
