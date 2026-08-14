# My History of Scouting Backend

Cloudflare Workers、Hono、Cloud Firestore で構成する My History of Scouting の API と静的配信です。

## 担当範囲

- `/apiv1/*` の認証付き JSON API
- Firebase ID トークンの検証
- Service Account による Firestore REST API への接続
- `backend/buildTmp/` に結合されたランディングページ、ヘルプ、SPA の配信

## 開発コマンド

```powershell
npm install
npm run typecheck
npm run dry-run
npm run dev
```

`npm run dev` は `wrangler dev --env=dev`、`npm run deploy` は本番 Worker へのデプロイです。
静的成果物を含む全体ビルドは、リポジトリルートの `build.bat` を使います。

## 構成

- `src/index.ts`：エラー処理、CORS、静的配信
- `src/apiRotuer.ts`：共通ミドルウェアと API ルート
- `src/user/`：User、招待、所属、共有一覧
- `src/scout/`：Scout の検索、CRUD、移管、共有
- `src/group/`：グループ設定、メンバー、招待
- `src/god/`：管理者向け直接操作
- `src/lib/firestore/`：Firestore クライアント、操作層、Zod スキーマ

## 文書

- [バックエンド設計](../docs/backend.md)
- [API 仕様](../docs/api.md)
- [データモデル](../docs/data-model.md)
- [セキュリティと権限](../docs/security.md)
- [セットアップ](../docs/setup.md)

仕様と文書が異なる場合は、ルート、スキーマ、`wrangler.jsonc` を一次資料として文書を更新します。
