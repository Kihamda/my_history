# バックエンド

## エントリーポイント

- [backend/src/index.ts](../backend/src/index.ts) - メインアプリ
- [backend/src/apiRotuer.ts](../backend/src/apiRotuer.ts) - API ルーター

## リクエスト処理の流れ

1. グローバル CORS 設定 (`IS_DEV === "TRUE"` で `*` 許可)
2. グローバルエラーハンドリング (`app.onError`)
3. 静的ファイルの配信 (`ASSETS` バインディング)
4. `/apiv1/*` を API ルーターへ
5. `firestoreMiddleware` で Firestore クライアント初期化
6. `authorize` で ID トークン検証 + メール認証確認
7. ユーザー操作以外は `loadUserData` でユーザーデータをロード
8. 各ドメインのルーターへ

## ミドルウェア

### グローバル (index.ts)

```typescript
// CORS
cors({
  origin: c.env.IS_DEV === "TRUE" ? "*" : null,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
})

// エラーハンドリング
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status)
  }
  return c.json({ message: "Internal Server Error" }, 500)
})
```

### API ルーター (apiRotuer.ts)

1. `firestoreMiddleware` - REST クライアント生成
2. `authorize` - Firebase ID トークン検証
3. `loadUserData` - Firestore のユーザーデータをコンテキストへ追加

実装: [backend/src/lib/auth.ts](../backend/src/lib/auth.ts), [backend/src/lib/userData.ts](../backend/src/lib/userData.ts)

### God ルーター

```typescript
.use("*", async (c, next) => {
  if (!userData.auth.isGod) return c.json({ message: "Forbidden" }, 403)
  await next()
})
```

## ルーター

| ルーター              | ベースパス       | 役割           | ファイル                   |
| --------------------- | ---------------- | -------------- | -------------------------- |
| `userRoute`           | `/apiv1/user`    | ユーザー操作   | `user/userRoute.ts`        |
| `userSettingsRoute`   | `/apiv1/user/auth` | 招待・脱退   | `user/userSettingsRoute.ts`|
| `scoutRoute`          | `/apiv1/scout`   | スカウト操作   | `scout/scoutRoute.ts`      |
| `groupRoute`          | `/apiv1/group`   | グループ操作   | `group/groupRoute.ts`      |
| `godRoute`            | `/apiv1/god`     | 管理者専用操作 | `god/godRoute.ts`          |

## Firestore アクセス

### Operator パターン

`firebase-rest-firestore` を `createOperator` でラップし、型安全なCRUD を提供

```typescript
db().scouts.get(id)           // 取得
db().scouts.set(id, data)     // 作成/更新
db().scouts.lis(query)        // 一覧 (フィルタ付き)
db().scouts.del(id)           // 削除

db().users.get(id)
db().groups.get(id)
```

実装: [backend/src/lib/firestore/operator.ts](../backend/src/lib/firestore/operator.ts)

### クエリ演算子

- `==`, `!=`, `<`, `<=`, `>`, `>=`
- `array-contains`, `in`, `array-contains-any`, `not-in`
- ドット記法でネストフィールドを指定 (4階層まで)

## 入力検証

Zod + `@hono/zod-validator` を使用

```typescript
.post(
  "/create",
  zValidator("json", ScoutCreateSchema),
  async (c) => {
    const data = c.req.valid("json")  // 型安全
  }
)
```

### 共通スキーマ

- `genIdSchema` - ID 形式 (`[A-Za-z0-9_-]+`, 1-100文字)
- `ymdSchema` - 日付形式 (`YYYY-MM-DD` または空文字)
- `emailSchema` - RFC 5322 メール
- `roleSchema` - `"ADMIN" | "EDIT" | "VIEW"`

実装: [backend/src/lib/firestore/schemas.ts](../backend/src/lib/firestore/schemas.ts)

## エラーハンドリング

- `HTTPException` を優先して返却
- 予期しないエラーは 500 に変換
- エラーメッセージは JSON 形式 `{ message: string }`

主なエラーコード:

| ステータス | 意味                 | メッセージ例             |
| ---------- | -------------------- | ------------------------ |
| 400        | 不正なリクエスト     | Invalid request          |
| 401        | 認証なし             | UNAUTHORIZED             |
| 403        | 認可なし/メール未認証 | EMAIL_VERIFY_MISSING     |
| 404        | リソースなし         | Scout not found          |
| 409        | 重複/上限            | User already a member    |

## 静的配信

### ルーティング

- `/` → `index.html` (Landing)
- `/help/*` → `help/*.html` (Help)
- `/app/*` `/auth/*` `/god/*` → `spa.html` (SPA)
- その他の静的ファイル → `ASSETS` バインディング

### ASSETS バインディング

Wrangler 設定で `backend/buildTmp/` を配信

```jsonc
{
  "assets": {
    "directory": "./buildTmp",
    "binding": "ASSETS"
  }
}
```

## キャッシュ

### KV キャッシュ

- `MY_HISTORY_KV_CACHE` バインディング
- Firebase 公開鍵のキャッシュに使用

### TTL キャッシュ (メモリ)

- グループ名: 5分
- スカウト名: 5分
- `getSharedScoutsHandler` などで使用

実装: [backend/src/lib/cache.ts](../backend/src/lib/cache.ts)

## ディレクトリ構成

```
backend/src/
├── index.ts                 # メインアプリ + 静的配信
├── apiRotuer.ts             # API ルーティング
├── client.ts                # Hono クライアント型エクスポート
├── lib/
│   ├── auth.ts              # JWT 検証
│   ├── userData.ts          # ユーザーデータ読み込み
│   ├── cache.ts             # TTL キャッシュ
│   ├── randomId.ts          # ID 生成
│   ├── scoutDefaultData.ts  # スカウト初期データ
│   ├── scoutGroup.ts        # ロール/ユニット定義
│   └── firestore/
│       ├── firestore.ts     # Firestore クライアント
│       ├── operator.ts      # CRUD オペレーター
│       └── schemas.ts       # Zod スキーマ
├── user/                    # ユーザー関連ルート
├── scout/                   # スカウト関連ルート
├── group/                   # グループ関連ルート
└── god/                     # 管理者関連ルート
```
