# My History Backend - プロジェクト概要

## プロジェクト概要

ボーイスカウトの活動履歴を管理するバックエンド API
スカウト個人の進級記録、技能章、行事章、団の管理を行う

## 主要機能

- **スカウト活動履歴管理**: 進級、技能章、行事章の記録と管理
- **グループ管理**: 団の作成・管理とメンバー権限管理
- **ユーザー管理**: ユーザープロファイルと所属グループ管理
- **検索機能**: スカウト情報の柔軟な検索とフィルタリング

## 技術スタック

| 項目               | 技術                            |
| ------------------ | ------------------------------- |
| **ランタイム**     | Cloudflare Workers              |
| **フレームワーク** | Hono v4                         |
| **データベース**   | Cloud Firestore (REST API 経由) |
| **認証**           | Firebase Authentication         |
| **バリデーション** | Zod                             |
| **言語**           | TypeScript                      |

## アーキテクチャ概要

3 層アーキテクチャを採用し関心の分離を実現

```
API処理層 (Route Handlers)
    ↓
ビジネスロジック層 (Services + Permissions)
    ↓
Firestore操作層 (Data Access)
    ↓
Cloud Firestore
```

詳細は [01-architecture.md](./01-architecture.md) を参照

## プロジェクト構成

```
src/
├── scout/          # スカウト機能モジュール
├── group/          # グループ機能モジュール
├── user/           # ユーザー機能モジュール
├── lib/            # 共通ライブラリ層
└── types/          # 型定義
```

## API エンドポイント

### Scout API (`/apiv1/scout`)

- スカウトの作成、取得、更新、削除、検索

### Group API (`/apiv1/group`)

- グループ管理とメンバー権限管理

### User API (`/apiv1/user`)

- ユーザープロファイル管理

詳細は [api/](./api/) ディレクトリ内のドキュメントを参照

## 権限管理

### ロール

| ロール    | 説明   | 権限                     |
| --------- | ------ | ------------------------ |
| **VIEW**  | 閲覧者 | 情報の閲覧のみ           |
| **EDIT**  | 編集者 | 作成・更新が可能         |
| **ADMIN** | 管理者 | 削除とグループ管理が可能 |

## セットアップ

詳細は [02-setup.md](./02-setup.md) を参照

### クイックスタート

```bash
# 依存関係のインストール
npm install

# ローカル開発サーバー起動
npm run dev

# デプロイ
npm run deploy
```

## 開発ガイドライン

詳細は [03-development.md](./03-development.md) を参照

### 新機能追加の基本フロー

1. スキーマ定義 (`lib/firestore/schemas.ts`)
2. Firestore 操作実装 (`lib/firestore/operations/`)
3. 権限チェック実装 (`*/permissions/`)
4. ビジネスロジック実装 (`*/services/`)
5. API ハンドラー実装
6. ルート定義

## ドキュメント構成

- [00-overview.md](./00-overview.md) - このファイル
- [01-architecture.md](./01-architecture.md) - アーキテクチャ詳細
- [02-setup.md](./02-setup.md) - セットアップとデプロイ
- [03-development.md](./03-development.md) - 開発ガイドライン
- [api/](./api/) - API 仕様
- [modules/](./modules/) - モジュール詳細仕様
- [changelog.md](./changelog.md) - 変更履歴

## ライセンス

(ライセンス情報を記載)

## 貢献

(貢献ガイドラインを記載)
