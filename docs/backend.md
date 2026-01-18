# バックエンド

## エントリーポイント

- [backend/src/index.ts](../backend/src/index.ts)
- [backend/src/apiRotuer.ts](../backend/src/apiRotuer.ts)

## リクエスト処理の流れ

1. CORS 設定とエラーハンドリング
2. 静的ファイルの配信
3. `/apiv1/*` を API ルーターへ
4. `firestoreMiddleware` で Firestore クライアント初期化
5. `authorize` で ID トークン検証
6. `loadUserData` でユーザーデータをロード
7. 各ドメインのルーターへ

## ミドルウェア

- `firestoreMiddleware` で REST クライアントを生成
- `authorize` が Firebase ID トークンを検証
- `loadUserData` が Firestore のユーザーデータをコンテキストへ追加

実装は [backend/src/lib/firestore/firestore.ts](../backend/src/lib/firestore/firestore.ts) と [backend/src/lib/auth.ts](../backend/src/lib/auth.ts)

## ルーター

| ルーター     | ベースパス     | 役割           |
| ------------ | -------------- | -------------- |
| `userRoute`  | `/apiv1/user`  | ユーザー操作   |
| `scoutRoute` | `/apiv1/scout` | スカウト操作   |
| `groupRoute` | `/apiv1/group` | グループ操作   |
| `godRoute`   | `/apiv1/god`   | 管理者専用操作 |

## Firestore アクセス

`firebase-rest-firestore` を `createOperator` でラップし、Zod スキーマでバリデーションする

実装は [backend/src/lib/firestore/operator.ts](../backend/src/lib/firestore/operator.ts)

## エラーハンドリング

- `HTTPException` を優先して返却
- 予期しないエラーは 500 に変換

実装は [backend/src/index.ts](../backend/src/index.ts)

## 静的配信

- [backend/buildTmp/](../backend/buildTmp/) を `site.bucket` で配信
- `/app/*` `/auth/*` `/god/*` は `spa.html` を返す
