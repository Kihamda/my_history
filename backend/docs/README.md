# ドキュメント

## 概要

My History Backend の技術仕様書と API ドキュメント

## ドキュメント構成

### 基本ドキュメント

| ファイル                                   | 説明                               |
| ------------------------------------------ | ---------------------------------- |
| [00-overview.md](./00-overview.md)         | プロジェクト概要と技術スタック     |
| [01-architecture.md](./01-architecture.md) | 3 層アーキテクチャ設計             |
| [02-setup.md](./02-setup.md)               | セットアップとデプロイ手順         |
| [03-development.md](./03-development.md)   | 開発ガイドラインとコーディング規約 |
| [changelog.md](./changelog.md)             | 変更履歴                           |

### API 仕様

| ファイル                       | 説明           |
| ------------------------------ | -------------- |
| [api/scout.md](./api/scout.md) | Scout API 仕様 |
| [api/user.md](./api/user.md)   | User API 仕様  |
| [api/group.md](./api/group.md) | Group API 仕様 |

### モジュール仕様

| ファイル                               | 説明                     |
| -------------------------------------- | ------------------------ |
| [modules/scout.md](./modules/scout.md) | Scout モジュール詳細仕様 |
| [modules/user.md](./modules/user.md)   | User モジュール詳細仕様  |
| [modules/group.md](./modules/group.md) | Group モジュール詳細仕様 |
| [modules/lib.md](./modules/lib.md)     | ライブラリ層詳細仕様     |

## クイックリンク

### 初めての方へ

1. [プロジェクト概要](./00-overview.md) - まずはこちらから
2. [アーキテクチャ設計](./01-architecture.md) - 全体構造を理解
3. [セットアップ](./02-setup.md) - 環境構築

### 開発者向け

1. [開発ガイドライン](./03-development.md) - コーディング規約
2. [API 仕様](./api/) - エンドポイント詳細
3. [モジュール仕様](./modules/) - 内部実装詳細

### API 利用者向け

1. [Scout API](./api/scout.md) - スカウト管理
2. [User API](./api/user.md) - ユーザー管理
3. [Group API](./api/group.md) - グループ管理

## 主要な概念

### 3 層アーキテクチャ

本プロジェクトは明確な責務分離を実現する 3 層アーキテクチャを採用

```
API処理層 → ビジネスロジック層 → Firestore操作層
```

詳細: [アーキテクチャ設計](./01-architecture.md)

### 権限管理

3 つのロールによる段階的な権限管理

- **VIEW**: 閲覧のみ
- **EDIT**: 作成・更新が可能
- **ADMIN**: 削除とグループ管理が可能

詳細: [Group API 仕様](./api/group.md#ロール権限レベル)

### データモデル

主要なエンティティ:

- **Scout**: スカウトの活動履歴
- **User**: ユーザープロファイル
- **Group**: 団の管理とメンバー情報

詳細: [アーキテクチャ設計 - データモデル](./01-architecture.md#データモデル)

## 技術スタック

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono v4
- **データベース**: Cloud Firestore (REST API 経由)
- **認証**: Firebase Authentication
- **バリデーション**: Zod
- **言語**: TypeScript

## バージョン情報

現在のバージョン: v2.0.0

変更履歴: [changelog.md](./changelog.md)

## ドキュメントの更新

新機能追加時は以下のドキュメントを更新してください:

1. 該当する API 仕様書 (`api/`)
2. 該当するモジュール仕様書 (`modules/`)
3. 変更履歴 (`changelog.md`)
4. README (必要に応じて)

詳細: [開発ガイドライン - ドキュメント更新](./03-development.md#ドキュメント更新)

## 貢献

ドキュメントの改善提案や誤字脱字の修正は随時受け付けています

プルリクエストを作成する際は:

- 変更内容を明確に記載
- 関連するドキュメントも同時に更新
- 一貫性のある用語を使用

## ライセンス

(ライセンス情報を記載)
