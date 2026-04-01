# 開発ガイドライン

## 基本方針

- 型安全性を最優先
- ルートでバリデーションを完結
- 直接 Firestore を触る処理は `db()` に統一
- エラーは `HTTPException` に寄せる

## バックエンド実装パターン

### 1. Zod スキーマを先に定義

```typescript
// Firestore スキーマ
import { ScoutRecordSchema } from "@b/lib/firestore/schemas"

// API 固有スキーマ
const CreateRequestSchema = z.object({
  name: z.string().min(1).max(100),
  scoutId: z.string().min(1).max(100),
  belongGroupId: genIdSchema,
})
```

- Firestore スキーマは [backend/src/lib/firestore/schemas.ts](../backend/src/lib/firestore/schemas.ts)
- API スキーマはハンドラーかルートで定義

### 2. ルートでバリデーション

```typescript
.post(
  "/create",
  zValidator("json", CreateRequestSchema),
  zValidator("param", z.object({ id: genIdSchema })),
  async (c) => {
    const body = c.req.valid("json")
    const { id } = c.req.valid("param")
    // ...
  }
)
```

- `zValidator` を使用
- 受け取る値は `c.req.valid()` から取り出す (型安全)

### 3. ハンドラーで権限と処理

```typescript
// 権限チェック
if (!c.var.user.fn.isInRoleOnGroup(groupId, ["ADMIN", "EDIT"])) {
  throw new HTTPException(403, { message: "Forbidden" })
}

// Firestore 操作
const scout = await db().scouts.get(id)
await db().scouts.set(id, data)
```

- `c.var.user` でロールと招待を参照
- `db()` で Firestore を操作

### 4. 例外は `HTTPException` に寄せる

```typescript
import { HTTPException } from "hono/http-exception"

throw new HTTPException(404, { message: "Scout not found" })
throw new HTTPException(403, { message: "Forbidden" })
throw new HTTPException(409, { message: "User already a member" })
```

## フロントエンド実装パターン

### 認証

```typescript
// 安全にコンテキストを取得 (未認証時はリダイレクト)
const { user, token } = useAuthContext(true)

// null チェックあり
const context = useAuthContext(false)
if (!context.user) { /* 未ログイン処理 */ }

// 現在のグループ (必須)
const group = useCurrentGroup()
```

- `AuthProvider` を通して `token` と `user` を利用
- `useAuthContext(true)` で安全に参照 (null なら /auth にリダイレクト)

### API

```typescript
import { hc } from "@f/lib/api/api"

// 型安全な API 呼び出し
const res = await hc.apiv1.scout[":id"].$get({
  param: { id: scoutId }
})
if (!res.ok) throw new Error(await res.text())
const data = await res.json()
```

- `hc` を経由して型付きのリクエストを発行
- ログイン状態に応じて `setHcClient` を更新

### エラー通知

```typescript
import { raiseError } from "@f/errorHandler"

try {
  await someApiCall()
} catch (e) {
  raiseError("操作に失敗しました", "error", e.stack)
}
```

## コーディング規約

- ファイル名は `camelCase` を基準
- ルーティングの追加は `Routes` に集約
- 役割の混在を避ける (ハンドラーとルート定義を分離)
- パスエイリアスを活用 (`@b/*`, `@f`)

## パスエイリアス

### バックエンド

```json
// backend/tsconfig.json
{
  "paths": {
    "@b/*": ["./src/*"]
  }
}
```

### フロントエンド

```typescript
// frontend/vite.config.ts
resolve: {
  alias: {
    "@f": path.resolve(__dirname, "src"),
    "@b": path.resolve(__dirname, "../backend/src"),
  }
}
```

## ドキュメント更新

変更が入ったら [docs/README.md](README.md) の更新ルールに従う

1. [data-model.md](data-model.md)
2. [api.md](api.md)
3. [frontend.md](frontend.md) または [backend.md](backend.md)
4. [changelog.md](changelog.md)
