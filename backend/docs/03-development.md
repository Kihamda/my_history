# 開発ガイドライン

## 開発フロー

### 新機能追加の手順

1. **スキーマ定義** (`lib/firestore/schemas.ts`)

   - Zod スキーマを定義
   - TypeScript 型を自動生成

2. **Firestore 操作** (`lib/firestore/operations/`)

   - 純粋な CRUD 操作を実装
   - ビジネスロジックを含まない

3. **権限チェック** (`*/permissions/`)

   - 権限判定関数を実装
   - boolean を返す関数

4. **ビジネスロジック** (`*/services/`)

   - 権限チェックとビジネスルール適用
   - エラーハンドリング

5. **ハンドラー** (`*/handlers/` または `*.ts`)

   - API ハンドラーを実装
   - リクエスト処理

6. **ルート定義** (`*/xxxRoute.ts`)

   - エンドポイントを定義
   - バリデーションを設定

7. **ドキュメント更新**
   - API ドキュメントを更新
   - README を更新

## コーディング規約

### 各層の責務を厳守

#### API 層 (Route Handlers)

- ✅ HTTP リクエスト/レスポンス処理
- ✅ Zod バリデーション
- ❌ ビジネスロジック
- ❌ データベース操作
- ❌ 権限チェック

#### Service 層 (Services)

- ✅ ビジネスロジック
- ✅ 権限チェック層の呼び出し
- ✅ エラーハンドリング
- ✅ HTTPException の生成
- ❌ データベース直接操作

#### Permissions 層

- ✅ 権限判定のみ
- ✅ boolean 返却
- ❌ 例外の発生
- ❌ データベース操作

#### Operations 層 (Data Access)

- ✅ 純粋な CRUD 操作
- ✅ データベースアクセス
- ❌ ビジネスロジック
- ❌ 権限チェック
- ❌ HTTPException の生成

### 命名規則

#### Service 層の関数

```typescript
// 権限チェック付きの関数には WithAuth サフィックス
async function getScoutWithAuth(db: Firestore, scoutId: string, uid: string);
async function createScoutWithAuth(
  db: Firestore,
  data: ScoutRecordSchemaType,
  uid: string
);
```

#### Permissions 層の関数

```typescript
// 権限判定は can または is プレフィックス
function canAccessScout(scout: ScoutRecordSchemaType, uid: string): boolean;
function isGroupAdmin(group: GroupRecordSchemaType, email: string): boolean;
```

#### Operations 層の関数

```typescript
// CRUD操作は動詞 + エンティティ名 + ById等
async function getScoutById(db: Firestore, scoutId: string);
async function createScoutRecord(
  db: Firestore,
  scoutId: string,
  data: ScoutRecordSchemaType
);
async function updateScoutRecord(
  db: Firestore,
  scoutId: string,
  data: Partial<ScoutRecordSchemaType>
);
async function deleteScoutRecord(db: Firestore, scoutId: string);
```

#### スキーマと型

```typescript
// スキーマ: xxxSchema
export const ScoutRecordSchema = z.object({ ... });

// 型: xxxSchemaType
export type ScoutRecordSchemaType = z.infer<typeof ScoutRecordSchema>;
```

### エラーハンドリング

#### Service 層で HTTPException を投げる

```typescript
import { HTTPException } from "hono/http-exception";

// 404 Not Found
if (!scout) {
  throw new HTTPException(404, { message: "Scout not found" });
}

// 403 Forbidden
if (!canAccessScout(scout, uid)) {
  throw new HTTPException(403, { message: "Permission denied" });
}

// 409 Conflict
if (existingUser) {
  throw new HTTPException(409, { message: "User already exists" });
}
```

#### Operations 層はエラーを上位に伝播

```typescript
// エラーはそのまま投げる
async function getScoutById(db: Firestore, scoutId: string) {
  try {
    const docRef = db.collection("scouts").doc(scoutId);
    const doc = await docRef.get();
    return doc.exists ? ScoutRecordSchema.parse(doc.data()) : null;
  } catch (error) {
    // Firestoreエラーはそのまま上位に伝播
    throw error;
  }
}
```

#### Permissions 層は例外を投げない

```typescript
// boolean を返すのみ
function canAccessScout(scout: ScoutRecordSchemaType, uid: string): boolean {
  if (scout.authedIds.includes(uid)) {
    return true;
  }
  // 例外を投げない
  return false;
}
```

### 型定義

#### すべての関数に型注釈

```typescript
// 良い例
async function getScoutById(
  db: Firestore,
  scoutId: string
): Promise<ScoutRecordSchemaType | null> {
  // ...
}

// 悪い例
async function getScoutById(db, scoutId) {
  // ...
}
```

#### Firestore スキーマから型を生成

```typescript
import { ScoutRecordSchema, ScoutRecordSchemaType } from '@b/lib/firestore/schemas';

// 型を使用
const scout: ScoutRecordSchemaType = { ... };
```

#### API 型は別途定義

```typescript
// types/api/scout.ts
export const SearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ...
});

export type SearchResultType = z.infer<typeof SearchResultSchema>;
```

### コメント

#### ファイル冒頭に @fileoverview

```typescript
/**
 * @fileoverview スカウト操作のビジネスロジック層
 *
 * 権限チェックとビジネスルールを適用し、
 * Firestore操作層を呼び出す
 */
```

#### 各関数に JSDoc コメント

```typescript
/**
 * スカウトを取得(権限チェック付き)
 *
 * @param db - Firestoreインスタンス
 * @param scoutId - スカウトID
 * @param uid - ユーザーID
 * @returns スカウトデータ
 * @throws {HTTPException} 404 - スカウトが見つからない
 * @throws {HTTPException} 403 - 権限がない
 */
async function getScoutWithAuth(
  db: Firestore,
  scoutId: string,
  uid: string
): Promise<ScoutRecordSchemaType> {
  // ...
}
```

#### 複雑なロジックには日本語コメント

```typescript
// 最後のADMINは削除できない
const adminCount = group.members.filter((m) => m.role === "ADMIN").length;
if (adminCount <= 1 && memberToRemove.role === "ADMIN") {
  throw new HTTPException(403, { message: "Cannot remove the last admin" });
}
```

## バリデーション

### Zod スキーマの定義

```typescript
// lib/firestore/schemas.ts
export const ScoutRecordSchema = z.object({
  authedIds: z.array(z.string()),
  personal: z.object({
    name: z.string().min(1),
    scoutId: z.string().min(1),
    birthDate: z.string(),
    // ...
  }),
  // ...
});
```

### リクエストバリデーション

```typescript
import { zValidator } from "@hono/zod-validator";

// パラメータのバリデーション
scoutRoute.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    // ...
  }
);

// ボディのバリデーション
scoutRoute.post("/create", zValidator("json", ScoutRecordSchema), async (c) => {
  const data = c.req.valid("json");
  // ...
});

// クエリのバリデーション
scoutRoute.get("/search", zValidator("query", SearchQuerySchema), async (c) => {
  const query = c.req.valid("query");
  // ...
});
```

## テスト

### ユニットテスト

各層を独立してテスト

```typescript
// __tests__/services/scoutService.test.ts
describe("getScoutWithAuth", () => {
  it("should return scout when user has access", async () => {
    const mockDb = createMockFirestore();
    const scout = await getScoutWithAuth(mockDb, "scout-1", "user-1");
    expect(scout).toBeDefined();
  });

  it("should throw 404 when scout not found", async () => {
    const mockDb = createMockFirestore();
    await expect(
      getScoutWithAuth(mockDb, "non-existent", "user-1")
    ).rejects.toThrow(HTTPException);
  });
});
```

### 統合テスト

実際の Firestore を使用

```typescript
// __tests__/integration/scout.test.ts
describe("Scout API Integration", () => {
  it("should create and retrieve scout", async () => {
    const response = await app.request("/apiv1/scout/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify(testScoutData),
    });

    expect(response.status).toBe(200);

    const { id } = await response.json();
    const getResponse = await app.request(`/apiv1/scout/${id}`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });

    expect(getResponse.status).toBe(200);
  });
});
```

## デバッグ

### ローカル開発

```bash
# 詳細ログ出力
wrangler dev --local --log-level debug

# 特定のポートで起動
wrangler dev --port 8788
```

### ログ出力

```typescript
// console.logは本番環境でも出力される
console.log("Debug info:", data);

// エラーログ
console.error("Error occurred:", error);
```

### Cloudflare Dashboard でログ確認

```bash
# リアルタイムログ
wrangler tail

# フィルタリング
wrangler tail --status error
```

## Git ワークフロー

### ブランチ戦略

- `main`: 本番環境
- `dev`: 開発環境
- `feature/*`: 機能追加
- `fix/*`: バグ修正
- `refactor/*`: リファクタリング

### コミットメッセージ

```
feat: スカウト削除機能を追加
fix: グループメンバー削除時のバグを修正
refactor: Service層を3層アーキテクチャに再構築
docs: API仕様書を更新
test: スカウトサービスのテストを追加
```

### プルリクエスト

- タイトルはコミットメッセージと同様の形式
- 変更内容の詳細を記載
- 関連する Issue をリンク
- レビュー後にマージ

## パフォーマンス最適化

### Firestore クエリ

```typescript
// 良い例: 必要なフィールドのみ取得
const scouts = await db
  .collection("scouts")
  .where("personal.belongGroupId", "==", groupId)
  .select("personal.name", "personal.scoutId")
  .get();

// 悪い例: すべてのフィールドを取得
const scouts = await db
  .collection("scouts")
  .where("personal.belongGroupId", "==", groupId)
  .get();
```

### ページネーション

```typescript
// ページネーション実装
const pageSize = 20;
const scouts = await db
  .collection("scouts")
  .where("personal.belongGroupId", "==", groupId)
  .limit(pageSize)
  .offset((page - 1) * pageSize)
  .get();
```

### KV キャッシュ活用

```typescript
// キャッシュの利用
const cacheKey = `scout:${scoutId}`;
const cached = await kv.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const scout = await getScoutFromFirestore(scoutId);
await kv.put(cacheKey, JSON.stringify(scout), { expirationTtl: 3600 });
return scout;
```

## セキュリティベストプラクティス

### 入力検証

- すべてのリクエストデータを Zod で検証
- XSS 対策のため HTML タグをエスケープ
- SQL インジェクション対策(Firestore は安全)

### 認証・認可

- すべての API で Firebase ID トークン検証
- 権限チェックを必ず実施
- 自分自身のデータのみアクセス可能

### シークレット管理

- `.env`ファイルは使用しない
- Wrangler シークレットを使用
- GitHub にシークレットをコミットしない

## トラブルシューティング

### よくあるエラー

#### "Schema validation failed"

- リクエストデータの形式を確認
- Zod スキーマ定義を確認

#### "Permission denied"

- Firebase 認証トークンを確認
- 権限チェックロジックを確認
- Firestore ルールを確認

#### "Resource not found"

- Firestore コレクション/ドキュメント存在確認
- パスパラメータの値を確認

### デバッグ手順

1. ログ出力を追加
2. ローカル開発環境で再現
3. 各層を順番に確認
4. エラーメッセージから原因を特定
5. 修正とテスト

## ドキュメント更新

新機能追加時は以下を更新:

- [ ] API 仕様書 (`docs/api/`)
- [ ] モジュール仕様書 (`docs/modules/`)
- [ ] 変更履歴 (`docs/changelog.md`)
- [ ] README (必要に応じて)
- [ ] コード内のコメント

## コードレビューチェックリスト

- [ ] 各層の責務を守っている
- [ ] 命名規則に従っている
- [ ] 型定義が適切
- [ ] エラーハンドリングが適切
- [ ] バリデーションを実装
- [ ] 権限チェックを実装
- [ ] テストを追加
- [ ] ドキュメントを更新
- [ ] パフォーマンスに問題ない
- [ ] セキュリティに問題ない
