# セットアップ

## 前提

- Node.js 18 以上
- Cloudflare アカウント
- Firebase プロジェクト (my-history-v2)

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
      "id": "...",
    },
  ],
}
```

### 環境変数 (Workers)

| 変数名                         | 種類    | 説明                         |
| ------------------------------ | ------- | ---------------------------- |
| `PROJECT_ID`                   | var     | Firebase プロジェクトID      |
| `PUBLIC_JWK_CACHE_KEY`         | var     | KV キャッシュキー            |
| `IS_DEV`                       | var     | 開発モード (`"TRUE"` で有効) |
| `MY_HISTORY_KV_CACHE`          | binding | KV Namespace                 |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | secret  | Service Account JSON         |
| `FIREBASE_CLIENT_EMAIL`        | secret  | SA クライアントメール        |

### ローカル開発

```bash
cd backend
npm install
npm run dev
```

### デプロイ

```bash
cd backend
npm run deploy
```

### 型チェック

```bash
cd backend
npm run typecheck
```

## フロントエンド

### 環境変数

| 変数名         | 説明           | デフォルト |
| -------------- | -------------- | ---------- |
| `VITE_API_URL` | API ベース URL | `/`        |

### ローカル開発

```bash
cd frontend
npm install
npm run dev
```

### ビルド

```bash
cd frontend
npm run build
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

- プロジェクトID: `my-history-v2`
- 認証ドメイン: `my-history-v2.firebaseapp.com`

### 必要なサービス

1. **Firebase Authentication** - メール/パスワード認証を有効化
2. **Cloud Firestore** - データベース作成
3. **Service Account** - バックエンド用の認証情報

### Service Account 設定

1. Firebase Console → プロジェクト設定 → サービスアカウント
2. 新しい秘密鍵を生成
3. JSON を Cloudflare Workers の Secret に設定
