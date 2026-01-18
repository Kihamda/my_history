# 開発ガイドライン

## 基本方針

- 型安全性を最優先
- ルートでバリデーションを完結
- 直接 Firestore を触る処理は `db()` に統一

## バックエンド実装パターン

### 1. Zod スキーマを先に定義

- Firestore スキーマは [backend/src/lib/firestore/schemas.ts](../backend/src/lib/firestore/schemas.ts)
- API スキーマはハンドラーかルートで定義

### 2. ルートでバリデーション

- `zValidator` を使用
- 受け取る値は `c.req.valid()` から取り出す

### 3. ハンドラーで権限と処理

- `c.var.user` でロールと招待を参照
- `db()` で Firestore を操作

### 4. 例外は `HTTPException` に寄せる

- 403, 404, 409 を明示

## フロントエンド実装パターン

### 認証

- `AuthProvider` を通して `token` と `user` を利用
- `useAuthContext(false)` で安全に参照

### API

- `hc` を経由して型付きのリクエストを発行
- ログイン状態に応じて `setHcClient` を更新

## コーディング規約

- ファイル名は `camelCase` を基準
- ルーティングの追加は `Routes` に集約
- 役割の混在を避ける

## ドキュメント更新

- 変更が入ったら [docs/README.md](README.md) の更新ルールに従う
