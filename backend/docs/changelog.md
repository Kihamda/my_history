# 変更履歴

## v2.0.0 - 2024-XX-XX

### 🎉 メジャーアップデート: 3 層アーキテクチャへの完全再構築

既存のデータベース構造と API レスポンスを維持しながら、コードベース全体を 3 層アーキテクチャに基づいて完全に再構築

### 新機能

#### Firestore スキーマ層の統一

- ✅ `src/lib/firestore/schemas.ts` を新規作成
- すべての Firestore コレクション(Scout, User, Group)のスキーマを Zod で統一定義
- 型安全性を完全に保証

#### 3 層アーキテクチャの確立

**API 処理層** (`xxxRoute.ts`)

- HTTP リクエスト受付
- Zod バリデーション
- レスポンス返却

**ビジネスロジック層** (`services/xxxService.ts`)

- 権限チェック
- ビジネスロジック実行
- 複数操作の調整

**Firestore 操作層** (`operations/*.ts`)

- 純粋な CRUD 操作
- データベースアクセスのみ

#### Scout CRUD 処理の完全実装

- ✅ `create.ts` - 作成処理
- ✅ `get.ts` - 取得処理
- ✅ `update.ts` - 更新処理
- ✅ `delete.ts` - 削除処理(新規作成)
- ✅ `search.ts` - 検索処理
- ✅ `services/scoutService.ts` - ビジネスロジック層
- ✅ `permissions/scoutPermissions.ts` - 権限チェック層

すべてに権限チェックとエラーハンドリングを実装

#### User CRUD 処理の実装

- ✅ `userRoute.ts` - 全エンドポイント実装
- ✅ `services/userService.ts` - ビジネスロジック層
- ✅ `handlers.ts` - ハンドラー関数
- GET/POST/PUT/DELETE をサポート

#### Group CRUD 処理の実装

- ✅ `groupRoute.ts` - 全エンドポイント実装
- ✅ `services/groupService.ts` - ビジネスロジック層
- ✅ `permissions/groupPermissions.ts` - 権限チェック層
- グループ管理
- メンバー管理(追加/削除/ロール変更)
- ADMIN 権限による厳密なアクセス制御

### 改善

#### エラーハンドリングとバリデーション

- すべての層で適切な HTTPException を使用
  - 404 Not Found
  - 403 Forbidden
  - 409 Conflict
- Zod による厳密な入力検証

#### 型定義の整理

- API 型と Firestore 型を明確に分離
- `src/lib/firestore/index.ts` で Firestore 関連をエクスポート
- `src/types/api/index.ts` で API 型をエクスポート
- インポートパスを統一

#### ドキュメント整備

- ✅ `ARCHITECTURE.md` - アーキテクチャドキュメント
- ✅ `src/scout/README.md` - Scout モジュール仕様
- ✅ `src/user/README.md` - User モジュール仕様
- ✅ `src/group/README.md` - Group モジュール仕様
- ✅ `src/lib/README.md` - ライブラリ層仕様

### 新規作成ファイル

```
src/lib/firestore/
  ├── schemas.ts                    # 統一スキーマ定義
  ├── index.ts                      # エクスポート集約
  └── operations/
      ├── scout.ts                  # Scout Firestore操作
      ├── user.ts                   # User Firestore操作
      └── group.ts                  # Group Firestore操作

src/scout/
  ├── delete.ts                     # 削除処理(新規)
  ├── permissions/
  │   └── scoutPermissions.ts       # 権限チェック
  └── services/
      └── scoutService.ts           # ビジネスロジック

src/user/
  ├── handlers.ts                   # ハンドラー関数
  └── services/
      └── userService.ts            # ビジネスロジック

src/group/
  ├── groupRoute.ts                 # グループAPI
  ├── permissions/
  │   └── groupPermissions.ts       # 権限チェック
  └── services/
      └── groupService.ts           # ビジネスロジック

src/types/
  ├── api/index.ts                  # API型エクスポート
  └── common/index.ts               # 共通型エクスポート

docs/                               # ドキュメントディレクトリ
  ├── 00-overview.md
  ├── 01-architecture.md
  ├── 02-setup.md
  ├── 03-development.md
  ├── api/
  │   ├── scout.md
  │   ├── user.md
  │   └── group.md
  └── changelog.md

ARCHITECTURE.md                     # アーキテクチャドキュメント
REBUILD_SUMMARY.md                  # 再構築サマリー
```

### 削除ファイル

```
src/lib/firestore/scout.ts          # 古い不完全な実装を削除
```

### 技術的負債の解消

- ビジネスロジックとデータアクセスの混在を解消
- 権限チェックを専用層に分離
- エラーハンドリングの統一
- 型定義の一元管理

### 破壊的変更

なし(既存の API エンドポイントとレスポンス形式は維持)

### アップグレードガイド

既存のフロントエンドコードは変更不要
バックエンドのみ再デプロイで完了

---

## v1.x.x - 以前のバージョン

### 初期実装

- Cloudflare Workers + Hono + Firebase Firestore
- Scout/User/Group の基本的な CRUD 操作
- Firebase Authentication 統合

---

## 今後の予定

### v2.1.0 (予定)

- [ ] テストコードの追加
  - ユニットテスト
  - 統合テスト
- [ ] ログ機能の強化
- [ ] パフォーマンスモニタリング

### v2.2.0 (予定)

- [ ] API ドキュメント(OpenAPI/Swagger)の生成
- [ ] GraphQL 対応の検討
- [ ] リアルタイムアップデート機能

### v3.0.0 (検討中)

- [ ] マイクロサービス化の検討
- [ ] キャッシュ戦略の最適化
- [ ] 全文検索機能の追加
