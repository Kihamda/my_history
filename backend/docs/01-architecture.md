# アーキテクチャ設計

## アーキテクチャパターン: 3 層アーキテクチャ

本アプリケーションは**関心の分離**を重視した 3 層アーキテクチャを採用

```
┌─────────────────────────────────────────────────────────────┐
│                      クライアント                            │
│                  (フロントエンド)                            │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│              [1] API処理層 (Route Handlers)                 │
│  責務: HTTPリクエスト/レスポンス処理                         │
│       リクエストバリデーション(Zod)                          │
│       ルーティング                                           │
│  場所: scout/scoutRoute.ts, group/groupRoute.ts, など       │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│          [2] ビジネスロジック層 (Services)                   │
│  責務: 権限チェック(Permissions層を使用)                     │
│       ビジネスルールの適用                                   │
│       エラーハンドリング                                     │
│  場所: scout/services/scoutService.ts, など                 │
│       scout/permissions/scoutPermissions.ts (権限チェック)  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           [3] Firestore操作層 (Data Access)                 │
│  責務: 純粋なCRUD操作                                        │
│       データベースアクセスの抽象化                           │
│       スキーマ定義(Zod)                                      │
│  場所: lib/firestore/operations/scout.ts, など              │
│       lib/firestore/schemas.ts (スキーマ定義)               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 Cloud Firestore Database                     │
└─────────────────────────────────────────────────────────────┘
```

## 各層の詳細

### [1] API 処理層 (Route Handlers)

**責務:**

- HTTP リクエストの受け取りとレスポンスの返却
- リクエストデータのバリデーション(Zod 使用)
- パスパラメータ・クエリパラメータの抽出
- ハンドラー関数の呼び出し
- HTTP ステータスコードの設定

**含まないもの:**

- ビジネスロジック
- データベース操作
- 権限チェック

**実装例:**

```typescript
// scout/scoutRoute.ts
scoutRoute.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    const uid = c.get("uid");

    const scout = await getScoutWithAuth(c.env.MY_HISTORY_KV_CACHE, id, uid);
    return c.json(scout);
  }
);
```

### [2] ビジネスロジック層 (Services + Permissions)

**責務:**

- 権限チェック層を使用した認可処理
- ビジネスルールの適用
- データ整合性の保証
- エラーハンドリングと HTTP 例外の生成
- Firestore 操作層の呼び出し

**特徴:**

- 各操作に`WithAuth`サフィックスを付けて権限チェック付きであることを明示
- HTTPException を使用してエラーを上位層に伝達
- Permissions 層を使用して権限判定を分離

**実装例:**

```typescript
// scout/services/scoutService.ts
export async function getScoutWithAuth(
  db: Firestore,
  scoutId: string,
  uid: string
) {
  const scout = await getScoutById(db, scoutId);

  if (!scout) {
    throw new HTTPException(404, { message: "Scout not found" });
  }

  if (!canAccessScout(scout, uid)) {
    throw new HTTPException(403, { message: "Permission denied" });
  }

  return scout;
}
```

### [3] Firestore 操作層 (Data Access)

**責務:**

- 純粋な CRUD 操作の実装
- データベースアクセスの抽象化
- クエリの実装

**含まないもの:**

- ビジネスロジック
- 権限チェック
- HTTP 例外の生成

**実装例:**

```typescript
// lib/firestore/operations/scout.ts
export async function getScoutById(db: Firestore, scoutId: string) {
  const docRef = db.collection("scouts").doc(scoutId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return ScoutRecordSchema.parse(doc.data());
}
```

## ディレクトリ構造と責務

```
src/
├── index.ts                      # アプリケーションエントリーポイント
├── apiRotuer.ts                  # APIルーターの統合と認証ミドルウェア
├── client.ts                     # Cloudflare Workers向けクライアント設定
│
├── scout/                        # スカウト機能モジュール
│   ├── scoutRoute.ts             # [API層] HTTPエンドポイント定義
│   ├── handlers/                 # [API層] リクエスト処理ハンドラー
│   │   ├── create.ts             # スカウト作成ハンドラー
│   │   ├── get.ts                # スカウト取得ハンドラー
│   │   ├── update.ts             # スカウト更新ハンドラー
│   │   ├── delete.ts             # スカウト削除ハンドラー
│   │   └── search.ts             # スカウト検索ハンドラー
│   ├── services/                 # [ビジネスロジック層]
│   │   └── scoutService.ts       # 権限チェックとビジネスロジック
│   └── permissions/              # [権限チェック層]
│       └── scoutPermissions.ts   # スカウト操作の権限判定
│
├── group/                        # グループ機能モジュール
│   ├── groupRoute.ts             # [API層] HTTPエンドポイント定義
│   ├── services/                 # [ビジネスロジック層]
│   │   └── groupService.ts       # グループ操作のビジネスロジック
│   └── permissions/              # [権限チェック層]
│       └── groupPermissions.ts   # グループ操作の権限判定
│
├── user/                         # ユーザー機能モジュール
│   ├── userRoute.ts              # [API層] HTTPエンドポイント定義
│   ├── handlers.ts               # [API層] リクエスト処理
│   └── services/                 # [ビジネスロジック層]
│       └── userService.ts        # ユーザー操作のビジネスロジック
│
├── lib/                          # 共通ライブラリ層
│   ├── auth.ts                   # Firebase認証関連
│   ├── randomId.ts               # ランダムID生成
│   ├── firestore/                # Firestore関連モジュール
│   │   ├── schemas.ts            # 全スキーマの統一定義(Zod)
│   │   ├── index.ts              # エクスポート集約
│   │   └── operations/           # [Firestore操作層]
│   │       ├── scout.ts          # スカウトCRUD操作
│   │       ├── user.ts           # ユーザーCRUD操作
│   │       └── group.ts          # グループCRUD操作
│   └── master/                   # マスターデータ関連
│
└── types/                        # 型定義
    ├── api/                      # API型定義
    └── common/                   # 共通型定義
```

## データモデル

### Scout (スカウト)

スカウトの活動履歴を管理するメインエンティティ

```typescript
{
  authedIds: string[]           // アクセス権を持つユーザーID配列
  personal: {                   // 個人情報
    name: string                // 氏名
    scoutId: string             // スカウトID
    birthDate: Date             // 生年月日
    joinedDate: Date            // 入団日
    belongGroupId: string       // 所属グループID
    currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob"  // 現在の所属隊
    memo: string                // メモ
    // ... その他のフィールド
  }
  unit: {                       // 各隊の活動履歴
    bvs: UnitData               // ビーバースカウト
    cs: UnitData                // カブスカウト
    bs: UnitData                // ボーイスカウト
    vs: UnitData                // ベンチャースカウト
    rs: UnitData                // ローバースカウト
  }
  ginosho: Ginosho[]           // 技能章配列
  event: Event[]               // 行事章配列
  last_Edited: Date            // 最終編集日時
}
```

### User (ユーザー)

ユーザープロファイル情報

```typescript
{
  displayName: string          // 表示名
  joinedGroupId?: string       // 所属グループID(オプション)
  knowGroupId: string[]        // 既知のグループID配列
}
```

### Group (グループ)

団の管理とメンバー情報

```typescript
{
  name: string                 // グループ名
  status: "ACTIVE" | "INACTIVE"  // ステータス
  members: [                   // メンバー配列
    {
      userEmail: string        // ユーザーのメールアドレス
      role: "ADMIN" | "EDIT" | "VIEW"  // ロール
    }
  ]
}
```

## 権限管理システム

### グループロール

| ロール    | 説明   | できること                                               |
| --------- | ------ | -------------------------------------------------------- |
| **VIEW**  | 閲覧者 | スカウト情報の閲覧、検索                                 |
| **EDIT**  | 編集者 | VIEW の権限 + スカウトの作成・更新                       |
| **ADMIN** | 管理者 | EDIT の権限 + スカウトの削除、グループ管理、メンバー管理 |

### アクセス制御ルール

#### スカウト操作

- **閲覧**: グループメンバー または `authedIds`に含まれる
- **作成**: グループの EDIT 以上
- **更新**: グループの EDIT 以上
- **削除**: グループの ADMIN のみ
- **検索**: グループメンバー

#### グループ操作

- **閲覧**: グループメンバー
- **更新**: ADMIN 権限
- **削除**: ADMIN 権限(メンバーが 1 人のみの場合)
- **メンバー管理**: ADMIN 権限

#### ユーザー操作

- **すべて**: 自分自身の情報のみ

## バリデーション戦略

### Zod スキーマの使い分け

#### Firestore スキーマ (`lib/firestore/schemas.ts`)

- データベースに保存される実際の型定義
- 厳密な型チェックとバリデーション
- TypeScript 型の自動生成
- 全コレクションのスキーマを一元管理

#### API スキーマ (`types/api/*.ts`)

- API レスポンス用の型定義
- クライアントに返却される形式
- Firestore スキーマとは別に定義

### バリデーションフロー

1. **リクエスト受信**: Zod バリデーション(`@hono/zod-validator`)
2. **ビジネスロジック**: 権限チェックとルール適用
3. **Firestore 保存**: Firestore スキーマでバリデーション
4. **レスポンス返却**: API スキーマ形式で返却

## エラーハンドリング

### HTTPException

サービス層で発生するエラーは`HTTPException`を使用

```typescript
import { HTTPException } from "hono/http-exception";

// 404 Not Found
throw new HTTPException(404, { message: "Scout not found" });

// 403 Forbidden
throw new HTTPException(403, { message: "Permission denied" });

// 409 Conflict
throw new HTTPException(409, { message: "Already exists" });
```

### グローバルエラーハンドラー

`src/index.ts`でアプリケーション全体のエラーハンドリング実装済み

## セキュリティ

### 多層防御アプローチ

1. **認証層**: すべての API で Firebase ID トークン検証
2. **認可層**: Service 層で各操作の権限チェック
3. **データ層**: Firestore ルールによる追加の保護
4. **バリデーション層**: Zod による厳密な入力検証

### データ分離

- グループ単位でデータを分離
- `authedIds`による細かいアクセス制御
- メンバーシップに基づく権限管理

## パフォーマンス最適化

### Firestore クエリ

- 適切なインデックスの作成
- ページネーションの実装
- 必要なフィールドのみ取得

### キャッシュ戦略

- JWK 公開鍵の KV キャッシュ
- 上位層でのキャッシュ実装を推奨

## アーキテクチャの利点

### 保守性

- 各層の責務が明確で変更が容易
- モジュール単位での独立した開発が可能
- ドキュメントが充実

### 拡張性

- 新機能追加のパターンが確立
- 層を追加しやすい設計
- スキーマ変更が管理しやすい

### 安全性

- 多層の権限チェック
- Zod による厳密なバリデーション
- 型安全性の保証

### テスタビリティ

- 各層を独立してテスト可能
- モック化しやすい設計
- ビジネスロジックが分離されてる
