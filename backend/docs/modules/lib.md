# Lib (ライブラリ)層 仕様

## 概要

アプリケーション全体で共有される基盤機能を提供するモジュール
Firestore スキーマ定義、データベース操作、認証、ユーティリティ関数を含む

## ディレクトリ構造

```
lib/
├── firestore/                    # Firestore関連
│   ├── schemas.ts                # 全Firestoreスキーマの統一定義(Zod)
│   ├── index.ts                  # Firestoreモジュールのエクスポート集約
│   └── operations/               # Firestore操作層(純粋CRUD)
│       ├── scout.ts              # スカウトデータのCRUD操作
│       ├── user.ts               # ユーザーデータのCRUD操作
│       └── group.ts              # グループデータのCRUD操作
├── auth.ts                       # Firebase認証関連
├── randomId.ts                   # ランダムID生成
└── master/                       # マスターデータ関連
```

## 各モジュールの責務

### firestore/

#### schemas.ts (スキーマ定義)

**責務:**

- 全 Firestore コレクションの Zod スキーマ定義
- 型安全性の保証
- バリデーションルールの一元管理

**定義されているスキーマ:**

- `ScoutRecordSchema` - スカウトデータ
- `UserRecordSchema` - ユーザーデータ
- `GroupRecordSchema` - グループデータ
- `GroupMemberSchema` - グループメンバー情報
- `CurrentUnitId` - 所属隊 ID
- その他の補助スキーマ

**特徴:**

- Zod によるランタイムバリデーション
- TypeScript 型の自動生成
- スキーマの一元管理で一貫性を保証

**使用例:**

```typescript
import { ScoutRecordSchema, ScoutRecordSchemaType } from '@b/lib/firestore/schemas';

// バリデーション
const scout = ScoutRecordSchema.parse(data);

// 型定義
const newScout: ScoutRecordSchemaType = { ... };
```

#### operations/ (Firestore 操作層)

**責務:**

- 純粋な CRUD 操作の実装
- データベースアクセスの抽象化
- ビジネスロジックを含まない

**特徴:**

- 各コレクションごとにファイルを分離
- シンプルで再利用可能な関数
- エラーハンドリングは上位層に委譲

##### scout.ts (スカウト操作)

**提供する関数:**

```typescript
// スカウト取得
async function getScoutById(
  db: Firestore,
  scoutId: string
): Promise<ScoutRecordSchemaType | null>;

// スカウト作成
async function createScoutRecord(
  db: Firestore,
  scoutId: string,
  data: ScoutRecordSchemaType
): Promise<void>;

// スカウト更新
async function updateScoutRecord(
  db: Firestore,
  scoutId: string,
  data: Partial<ScoutRecordSchemaType>
): Promise<void>;

// スカウト削除
async function deleteScoutRecord(db: Firestore, scoutId: string): Promise<void>;

// スカウト検索
async function searchScouts(
  db: Firestore,
  query: SearchQuery
): Promise<ScoutRecordSchemaType[]>;
```

**検索機能:**

- 名前による部分一致検索
- スカウト ID による完全一致検索
- 所属隊による絞り込み
- ページネーション対応

##### user.ts (ユーザー操作)

**提供する関数:**

```typescript
// ユーザー取得
async function getUserById(
  db: Firestore,
  userId: string
): Promise<UserRecordSchemaType | null>;

// ユーザー作成
async function createUserRecord(
  db: Firestore,
  userId: string,
  data: UserRecordSchemaType
): Promise<void>;

// ユーザー更新
async function updateUserRecord(
  db: Firestore,
  userId: string,
  data: Partial<UserRecordSchemaType>
): Promise<void>;

// ユーザー削除
async function deleteUserRecord(db: Firestore, userId: string): Promise<void>;
```

**特徴:**

- シンプルな CRUD 操作のみ
- 認証トークンとの紐付けは上位層で実施

##### group.ts (グループ操作)

**提供する関数:**

```typescript
// グループ取得
async function getGroupById(
  db: Firestore,
  groupId: string
): Promise<GroupRecordSchemaType | null>;

// グループ作成
async function createGroupRecord(
  db: Firestore,
  groupId: string,
  data: GroupRecordSchemaType
): Promise<void>;

// グループ更新
async function updateGroupRecord(
  db: Firestore,
  groupId: string,
  data: Partial<GroupRecordSchemaType>
): Promise<void>;

// グループ削除
async function deleteGroupRecord(db: Firestore, groupId: string): Promise<void>;
```

**特徴:**

- メンバー管理は更新操作で実施
- 権限チェックは上位層で実施

#### index.ts (エクスポート集約)

**責務:**

- Firestore モジュールの公開 API を定義
- インポートパスの簡略化

**エクスポート内容:**

- 全スキーマと型定義
- 全 Firestore 操作関数

**使用例:**

```typescript
// 単一のインポートで全てにアクセス
import {
  ScoutRecordSchema,
  ScoutRecordSchemaType,
  getScoutById,
  createScoutRecord,
} from "@b/lib/firestore";
```

### auth.ts (認証関連)

**責務:**

- Firebase 認証の初期化
- 認証トークンの検証
- 認証ミドルウェアの提供

**主要な機能:**

```typescript
// Firebase Admin SDKの初期化
initializeFirebaseAdmin(env: Env): void

// IDトークンの検証
verifyIdToken(token: string): Promise<DecodedIdToken>

// 認証ミドルウェア
authMiddleware(c: Context, next: Next): Promise<void>
```

**使用方法:**

- API ルーターで認証ミドルウェアとして使用
- 全 API エンドポイントで認証を必須化

**例:**

```typescript
import { authMiddleware } from "@b/lib/auth";

const app = new Hono();
app.use("/apiv1/*", authMiddleware);
```

### randomId.ts (ランダム ID 生成)

**責務:**

- ランダムな文字列 ID の生成
- URL セーフな文字列の生成

**提供する関数:**

```typescript
// 指定した長さのランダムID生成
function generateRandomId(length: number): string;
```

**特徴:**

- 英数字のみ使用(URL セーフ)
- 指定した長さの文字列を生成
- スカウト ID、グループ ID などで使用

**使用例:**

```typescript
import { generateRandomId } from "@b/lib/randomId";

// 30文字のランダムID生成
const scoutId = generateRandomId(30);
const groupId = generateRandomId(30);
```

### master/ (マスターデータ関連)

**責務:**

- 進級・技能章などのマスターデータ管理
- CSV からのデータ読み込み
- マスターデータの API 提供

**注意:**

- このディレクトリの詳細は別途ドキュメント参照

## アーキテクチャにおける位置付け

### 3 層アーキテクチャとの関係

```
┌─────────────────────────────────────┐
│    API処理層 (Route Handlers)      │
│  - HTTPリクエスト/レスポンス処理    │
│  - バリデーション                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   ビジネスロジック層 (Services)     │
│  - 権限チェック                     │
│  - ビジネスルール適用               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Firestore操作層 (lib/firestore)   │ ← lib層
│  - 純粋なCRUD操作                   │
│  - データベースアクセス             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Firestore Database          │
└─────────────────────────────────────┘
```

### lib 層の役割

- **基盤機能の提供**: アプリケーション全体で使用される基本機能
- **抽象化**: データベースアクセスの詳細を隠蔽
- **再利用性**: 複数の機能モジュールから利用可能
- **型安全性**: Zod スキーマによる厳密な型定義

## スキーマ定義の原則

### Zod スキーマの使用

- すべての Firestore データに Zod スキーマを定義
- ランタイムバリデーションを実施
- TypeScript 型を自動生成

### スキーマの命名規則

- スキーマ名: `xxxSchema` (例: `ScoutRecordSchema`)
- 型名: `xxxSchemaType` (例: `ScoutRecordSchemaType`)

### スキーマの配置

- 全スキーマを`schemas.ts`に一元管理
- 関連するスキーマをグループ化
- コメントで各フィールドの意味を説明

## Firestore 操作の原則

### 純粋性

- ビジネスロジックを含まない
- 副作用を最小限に抑える
- 単一責任の原則を遵守

### エラーハンドリング

- データベースエラーはそのまま上位層に伝播
- ビジネスエラーは上位層で処理
- HTTP 例外は上位層で生成

### トランザクション

- 複数の Firestore 操作が必要な場合は上位層で実施
- 操作層は単一のドキュメント操作のみ

## 拡張性

### 新しいコレクションの追加

1. `schemas.ts`に Zod スキーマを追加
2. `operations/`に新しいファイルを作成
3. CRUD 操作関数を実装
4. `index.ts`でエクスポート

### 新しいバリデーションルールの追加

1. `schemas.ts`の該当スキーマを更新
2. Zod のバリデーションメソッドを使用
3. カスタムバリデーションが必要な場合は`.refine()`を使用

## セキュリティ

### データベースアクセス

- Firestore 操作層は権限チェックを行わない
- 権限チェックは上位層(Services)で実施
- Firestore ルールと併用して多層防御

### スキーマバリデーション

- 全データ入力時に Zod バリデーション実施
- 不正なデータの混入を防止
- 型安全性を保証

## パフォーマンス

### クエリの最適化

- インデックスの活用
- 必要なフィールドのみ取得
- ページネーションの実装

### キャッシュ

- 上位層でのキャッシュ実装を推奨
- 操作層はキャッシュを持たない

## テスト

### ユニットテスト

- 各操作関数を個別にテスト
- モック Firestore を使用
- スキーマバリデーションのテスト

### 統合テスト

- 実際の Firestore を使用
- エンドツーエンドのデータフロー確認

## まとめ

lib 層は:

- アプリケーションの基盤機能を提供
- Firestore アクセスを抽象化
- 型安全性とデータ整合性を保証
- 再利用可能で拡張性の高い設計
- 3 層アーキテクチャの最下層として機能
