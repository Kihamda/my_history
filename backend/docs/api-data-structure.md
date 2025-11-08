# API データ構造仕様

## 概要

本 API は**Firestore のデータ構造と API レスポンスを完全に一致させる**設計方針を採用

この方針により:

- ✅ フロントエンドとバックエンドでデータ構造が統一される
- ✅ 型定義の重複が避けられる
- ✅ データ変換処理が最小限になる
- ✅ デバッグが容易になる

## データフロー

```
┌─────────────────────────────────────────────────────────┐
│                    クライアント                          │
└─────────────────────────────────────────────────────────┘
                         ↕
              (Firestore構造そのまま)
                         ↕
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Hono)                      │
│                                                          │
│  リクエスト: Firestore構造でバリデーション               │
│  レスポンス: Firestore構造をそのまま返却                 │
└─────────────────────────────────────────────────────────┘
                         ↕
              (Firestore構造そのまま)
                         ↕
┌─────────────────────────────────────────────────────────┐
│              Cloud Firestore Database                    │
└─────────────────────────────────────────────────────────┘
```

## Scout API

### GET /apiv1/scout/:id

**レスポンス:** `ScoutRecordSchemaType` (Firestore スキーマそのまま)

```typescript
{
  authedIds: string[];
  personal: {
    name: string;
    scoutId: string;
    birthDate: Date;
    joinedDate: Date;
    belongGroupId: string;
    currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob";
    memo: string;
    declare: { date: Date|null; place: string; done: boolean; };
    religion: { date: Date|null; type: string; done: boolean; };
    faith: { date: Date|null; done: boolean; };
  };
  unit: {
    bvs: UnitData;
    cs: UnitData;
    bs: UnitData;
    vs: UnitData;
    rs: UnitData;
  };
  ginosho: Ginosho[];
  event: Event[];
  last_Edited: Date;
}
```

### POST /apiv1/scout/create

**リクエスト:** `ScoutCreateType` (必須フィールドのみ)

```typescript
{
  name: string;
  scoutId: string;
  birthDate: Date;
  joinedDate: Date;
  belongGroupId: string;
  currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob";
  memo?: string;
}
```

**レスポンス:**

```typescript
{
  id: string;
  message: string;
}
```

### PUT /apiv1/scout/:id

**リクエスト:** `Partial<ScoutRecordSchemaType>` (部分更新)

Firestore スキーマのすべてのフィールドがオプション
更新したいフィールドのみ送信

**レスポンス:**

```typescript
{
  message: string;
}
```

### DELETE /apiv1/scout/:id

**レスポンス:**

```typescript
{
  message: string;
}
```

### GET /apiv1/scout/search

**リクエスト:**

```typescript
{
  name?: string;
  scoutId?: string;
  currentUnit?: ("bvs"|"cs"|"bs"|"vs"|"rs"|"ob")[];
  page: number;
}
```

**レスポンス:** `SearchResultType[]` (最小限のフィールド)

```typescript
[
  {
    id: string;
    name: string;
    scoutId: string;
    currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob";
    currentUnitName: string; // 日本語名
  }
]
```

**注:** 検索結果は必要最小限の情報のみ返す(パフォーマンス最適化)
完全なデータが必要な場合は `GET /scout/:id` を使用

---

## User API

### GET /apiv1/user

**レスポンス:** `UserProfileType` (Firebase Auth + Firestore 結合)

```typescript
{
  uid: string;              // Firebase Auth
  email: string;            // Firebase Auth
  emailVerified: boolean;   // Firebase Auth
  displayName: string;      // Firestore
  knowGroupId: string[];    // Firestore
  joinedGroup?: {           // Firestore + Group結合
    id: string;
    name: string;
    role: "ADMIN"|"EDIT"|"VIEW";
  };
}
```

**注:** UserProfile のみ特殊(Firebase Auth と Firestore を結合)

### POST /apiv1/user

**リクエスト:** `UserRecordSchemaType`

```typescript
{
  displayName: string;
  joinedGroupId?: string;
  knowGroupId: string[];
}
```

**レスポンス:**

```typescript
{
  message: string;
}
```

### PUT /apiv1/user

**リクエスト:** `Partial<UserRecordSchemaType>`

**レスポンス:**

```typescript
{
  message: string;
}
```

### DELETE /apiv1/user

**レスポンス:**

```typescript
{
  message: string;
}
```

---

## Group API

### GET /apiv1/group/:id

**レスポンス:** `GroupRecordSchemaType` (Firestore スキーマそのまま)

```typescript
{
  name: string;
  status: "ACTIVE" | "INACTIVE";
  members: [
    {
      userEmail: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }
  ];
}
```

### POST /apiv1/group

**リクエスト:**

```typescript
{
  name: string;
  status: "ACTIVE" | "INACTIVE";
}
```

**レスポンス:**

```typescript
{
  id: string;
  message: string;
}
```

### PUT /apiv1/group/:id

**リクエスト:** `Partial<GroupRecordSchemaType>`

**レスポンス:**

```typescript
{
  message: string;
}
```

### DELETE /apiv1/group/:id

**レスポンス:**

```typescript
{
  message: string;
}
```

### POST /apiv1/group/:id/members

**リクエスト:**

```typescript
{
  userEmail: string;
  role: "ADMIN" | "EDIT" | "VIEW";
}
```

**レスポンス:**

```typescript
{
  message: string;
}
```

### DELETE /apiv1/group/:id/members/:email

**レスポンス:**

```typescript
{
  message: string;
}
```

### PUT /apiv1/group/:id/members/:email/role

**リクエスト:**

```typescript
{
  role: "ADMIN" | "EDIT" | "VIEW";
}
```

**レスポンス:**

```typescript
{
  message: string;
}
```

---

## データ構造の統一方針

### 基本原則

1. **API レスポンスは Firestore スキーマと一致**

   - カスタムレスポンス型は定義しない
   - `ScoutRecordSchemaType`等を直接使用

2. **リクエストも Firestore スキーマを使用**

   - POST: 必要なフィールドのみのサブセット
   - PUT: `Partial<T>` で部分更新

3. **例外: 検索 API と User Profile API**
   - 検索: パフォーマンスのため最小限のフィールド
   - User Profile: Firebase Auth と Firestore の結合が必要

### 型定義の配置

```
src/
├── lib/firestore/schemas.ts   # 全Firestoreスキーマ(単一ソース)
└── types/api/
    ├── scout.ts               # Scout作成スキーマ + 再エクスポート
    ├── user.ts                # UserProfile + 再エクスポート
    ├── group.ts               # 再エクスポートのみ
    └── search.ts              # 検索専用スキーマ
```

### メリット

**1. 型の単一ソース**

- Firestore スキーマが唯一の真実
- API 型は再エクスポートのみ
- 変更時の影響範囲が明確

**2. フロントエンドとの統一**

- 同じ型定義を共有可能
- データ変換ロジック不要
- デバッグが容易

**3. 保守性向上**

- スキーマ変更が 1 箇所で完結
- 型の整合性が自動保証
- リファクタリングが安全

### デメリットと対策

**デメリット:**

- Firestore の内部構造が外部に露出
- 将来の構造変更が困難になる可能性

**対策:**

1. セマンティックバージョニング

   - 破壊的変更は major version up
   - API バージョニング (`/apiv1/`, `/apiv2/`)

2. 慎重なスキーマ設計

   - 初期段階で十分検討
   - フィールド追加は常に `optional`

3. 移行期間の設定
   - 旧バージョンのサポート期間明示
   - deprecation 警告の実装

---

## 日付型の取り扱い

### Firestore スキーマ

```typescript
birthDate: z.date();
```

### JSON シリアライゼーション

Hono は自動的に `Date` オブジェクトを ISO 8601 文字列に変換

```json
{
  "birthDate": "2010-04-01T00:00:00.000Z"
}
```

### フロントエンド側の処理

```typescript
// APIレスポンスを受け取った後
const scout = await response.json();

// 必要に応じてDate型に変換
const birthDate = new Date(scout.personal.birthDate);
```

---

## まとめ

本 API は**シンプルさと一貫性**を重視し、Firestore のデータ構造をそのまま公開する設計

- ✅ データ変換レイヤーなし
- ✅ 型定義の重複なし
- ✅ フロントエンドとバックエンドの統一
- ✅ 保守性の向上

例外は必要最小限(検索 API、User Profile API)に限定
