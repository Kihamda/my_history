# セットアップとデプロイ

最終更新：2026-08-14

ローカルと CI の基準は Node.js 22 です。
Cloudflare Workers と Firebase の本番用、開発用プロジェクトを別に用意します。

## 依存関係のインストール

三つのプロジェクトは依存関係を共有しません。

```powershell
Set-Location frontend
npm install
Set-Location ../backend
npm install
Set-Location ../staticSiteMarger
npm install
```

CI と同じ固定バージョンを使う場合は、それぞれのディレクトリで `npm ci` を実行します。

## フロントエンド設定

フロントエンドが現在参照する任意の環境変数は二つです。

| 変数 | 用途 | 既定値 |
| --- | --- | --- |
| `VITE_API_URL` | Hono API の基準 URL | `/` |
| `VITE_IS_DEV` | `TRUE` の場合に開発用 Firebase 設定を選択 | 未設定 |

Firebase の Web 設定は現在 `frontend/src/firebase.ts` に本番用と開発用が記述されています。
以前の文書にあった `VITE_FIREBASE_*` は、現在のコードでは参照しません。

ローカルで開発用 Firebase を選ぶ場合は、`frontend/.env.development.local` などに次を設定します。

```dotenv
VITE_IS_DEV=TRUE
```

```powershell
Set-Location frontend
npm run dev
```

## Workers 設定

`backend/wrangler.jsonc` は、本番と `dev` の Worker 名、Firebase プロジェクト ID、KV、ASSETS を定義します。

| バインディング | 種類 | 用途 |
| --- | --- | --- |
| `PROJECT_ID` | var | Firebase プロジェクト ID |
| `PUBLIC_JWK_CACHE_KEY` | var | Firebase 公開鍵の KV キー |
| `IS_DEV` | var | `dev` だけが `TRUE` |
| `MY_HISTORY_KV_CACHE` | KV | Firebase 公開鍵キャッシュ |
| `ASSETS` | assets | `backend/buildTmp/` の配信 |
| `FIREBASE_CLIENT_EMAIL` | secret | Service Account の client email |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | secret | Service Account の private key |

`FIREBASE_SERVICE_ACCOUNT_KEY` には Service Account JSON 全体ではなく、`private_key` の値を設定します。

```powershell
Set-Location backend
npx wrangler secret put FIREBASE_CLIENT_EMAIL
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
npx wrangler secret put FIREBASE_CLIENT_EMAIL --env dev
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY --env dev
```

KV の ID と公開可能な環境変数は `wrangler.jsonc` にあります。
Secret はリポジトリへ保存しません。

## ローカル検証

フロントエンドだけを検証します。

```powershell
Set-Location frontend
npm run build
```

バックエンドの型と Worker バンドルを検証します。

```powershell
Set-Location backend
npm run typecheck
npm run dry-run
```

静的ページだけを生成し、他プロジェクトへコピーしない場合は次を使います。

```powershell
Set-Location staticSiteMarger
npm run test
```

リポジトリ全体の成果物を作る場合は、ルートで `build.bat` を実行します。
このバッチは frontend のビルド、静的ページの生成と結合、Wrangler dry-run を順に行います。

## ローカル API

```powershell
Set-Location backend
npm run dev
```

`npm run dev` は `wrangler dev --env=dev` を実行します。
フロントエンドから別オリジンの Worker へ接続する場合は、`VITE_API_URL` にその URL を設定します。

## デプロイ

本番は次のコマンドを使います。

```powershell
Set-Location backend
npm run deploy
```

開発環境は次のコマンドを使います。

```powershell
Set-Location backend
npx wrangler deploy --env=dev --minify
```

手動デプロイの前に、`frontend`、`staticSiteMarger` の順で成果物を生成し、`backend/buildTmp/` を最新にします。

## GitHub Actions

Pull Request では Node.js 22 を使い、三プロジェクトの `npm ci`、フロントエンドビルド、静的生成、Wrangler dry-run を実行します。
`dev` への push は GitHub Environment `development` から開発 Worker、`main` への push は `production` から本番 Workerへデプロイします。

各 Environment には `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が必要です。
開発デプロイで開発用 Firebase 設定をフロントエンドへ組み込む場合は、Environment variable `VITE_IS_DEV=TRUE` を設定します。
