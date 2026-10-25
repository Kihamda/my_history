# My History of Scouting ドキュメント

最終更新：2026-08-14

このディレクトリには、My History of Scouting の開発、運用、保守に必要な資料をまとめています。
仕様を確認するときは、説明の重複を避けるため、次の案内から目的に合う文書を選んでください。

## 最初に読む文書

- [architecture.md](architecture.md)：三つのデプロイ対象とリクエスト、データ、ビルドの流れ
- [setup.md](setup.md)：ローカル環境の準備、ビルド、デプロイ
- [development.md](development.md)：実装規約、検証コマンド、文書の更新手順

## 実装を確認する文書

- [frontend.md](frontend.md)：SPA のルーティング、認証状態、サーバー状態、ブラウザ保存
- [backend.md](backend.md)：Workers の処理順、API モジュール、Firestore アクセス
- [api.md](api.md)：39 エンドポイントの一覧、入力、権限
- [data-model.md](data-model.md)：Firestore の三コレクションと保存形式
- [security.md](security.md)：現在の認証、認可、権限設計
- [static-site.md](static-site.md)：ランディングページとヘルプの生成、SPA との結合
- [tech-stack.md](tech-stack.md)：ロックファイルで解決された主要依存関係

## 計画と履歴を確認する文書

- [roadmap.md](roadmap.md)：実装済みの範囲と改善の優先順位
- [changelog.md](changelog.md)：文書と主要機能の変更履歴
- [利用者ヘルプ](../staticSiteMarger/help/pages/README.md)：アプリ利用者向けの操作案内
- [AIエージェント向けガイド](../AGENTS.md)：リポジトリ内で変更するときの共通規約

## リポジトリの構成

- [frontend/](../frontend/)：React と Bootstrap で構成する SPA
- [backend/](../backend/)：Cloudflare Workers 上で動く Hono API と静的ファイル配信
- [staticSiteMarger/](../staticSiteMarger/)：React SSR によるランディングページと Markdown ヘルプの生成

`staticSiteMarger` や `apiRotuer.ts` など、公開パスや参照関係に組み込まれた既存の綴りは、単独では変更しません。

## 仕様の根拠

文書より実装を優先します。
依存関係は各 `package.json` と `package-lock.json`、データ形式は `backend/src/lib/firestore/schemas.ts`、API は各ルート、配信設定は `backend/wrangler.jsonc` と GitHub Actions を一次資料とします。

機能を変更した場合は、同じ変更で関連文書も更新します。
データ形式を変えた場合は `data-model.md`、HTTP 契約を変えた場合は `api.md`、画面またはサーバー内部を変えた場合は `frontend.md` または `backend.md`、運用上の影響がある場合は `security.md` と `roadmap.md` を確認します。
