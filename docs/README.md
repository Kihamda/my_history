# My History of Scouting ドキュメント

最終更新: 2026-01-18

このディレクトリはフロントエンド、バックエンド、静的サイト生成の情報をまとめた単一のドキュメント置き場だよ
実装とズレないようにコードベースを基準に更新している

## ドキュメント一覧

- [architecture.md](architecture.md) 全体アーキテクチャとデータフロー
- [tech-stack.md](tech-stack.md) 技術スタックとバージョン
- [frontend.md](frontend.md) フロントエンド設計とルーティング
- [backend.md](backend.md) バックエンド設計とミドルウェア
- [api.md](api.md) API 仕様とエンドポイント
- [data-model.md](data-model.md) Firestore データモデル
- [security.md](security.md) 認証、認可、権限設計
- [setup.md](setup.md) セットアップと環境構築
- [development.md](development.md) 開発フローと規約
- [static-site.md](static-site.md) 静的サイト生成と配信
- [roadmap.md](roadmap.md) 実装計画と優先度
- [changelog.md](changelog.md) 変更履歴
- [firestore.rules](firestore.rules) Firestore ルール草案

## 主要ディレクトリ

- [frontend/](../frontend/) React SPA
- [backend/](../backend/) Cloudflare Workers API
- [staticSiteMarger/](../staticSiteMarger/) 静的サイト生成ツール

## 更新ルール

機能追加や仕様変更が入ったら次の順で更新

1. [data-model.md](data-model.md)
2. [api.md](api.md)
3. [frontend.md](frontend.md) または [backend.md](backend.md)
4. [changelog.md](changelog.md)
