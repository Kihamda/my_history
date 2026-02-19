# My History Backend

ボーイスカウトの活動履歴を管理するバックエンド API

## 概要

Cloudflare Workers + Hono + Firebase Firestore + TypeScript で構築された、スカウト活動履歴管理システムのバックエンド

**主な機能:**

- スカウト活動履歴の管理(進級・技能章・行事章)
- グループ(団)管理とメンバー権限管理
- ユーザープロファイル管理

## クイックスタート

```bash
# 依存関係のインストール
npm install

# ローカル開発サーバー起動
npm run dev

# デプロイ
npm run deploy
```

## ドキュメント

詳細な仕様書とガイドは [`docs/`](./docs/) ディレクトリを参照

### 基本ドキュメント

- [プロジェクト概要](./docs/00-overview.md) - 技術スタックと主要機能
- [アーキテクチャ設計](./docs/01-architecture.md) - 3 層アーキテクチャの詳細
- [セットアップとデプロイ](./docs/02-setup.md) - 環境構築手順
- [開発ガイドライン](./docs/03-development.md) - コーディング規約

### API 仕様

- [Scout API](./docs/api/scout.md) - スカウト管理 API
- [User API](./docs/api/user.md) - ユーザー管理 API
- [Group API](./docs/api/group.md) - グループ管理 API

### モジュール仕様

- [Scout モジュール](./docs/modules/scout.md) - 内部実装詳細
- [User モジュール](./docs/modules/user.md) - 内部実装詳細
- [Group モジュール](./docs/modules/group.md) - 内部実装詳細
- [Lib モジュール](./docs/modules/lib.md) - ライブラリ層詳細

## 技術スタック

| 項目               | 技術                            |
| ------------------ | ------------------------------- |
| **ランタイム**     | Cloudflare Workers              |
| **フレームワーク** | Hono v4                         |
| **データベース**   | Cloud Firestore (REST API 経由) |
| **認証**           | Firebase Authentication         |
| **バリデーション** | Zod                             |
| **言語**           | TypeScript                      |

## アーキテクチャ

3 層アーキテクチャを採用し関心の分離を実現

```
API処理層 (Route Handlers)
    ↓
ビジネスロジック層 (Services + Permissions)
    ↓
Firestore操作層 (Data Access)
```

詳細は [アーキテクチャ設計](./docs/01-architecture.md) を参照

## ライセンス

(ライセンス情報を記載)
