# フロントエンド

## エントリーポイント

- [frontend/src/main.tsx](../frontend/src/main.tsx)
- [frontend/src/App.tsx](../frontend/src/App.tsx)

`App.tsx` がアプリ全体のルーティングを担う

## ルーティング構成

| パス      | 役割         | コンポーネント |
| --------- | ------------ | -------------- |
| `/`       | リロード誘導 | `Reload`       |
| `/auth/*` | 認証領域     | `Auth`         |
| `/app/*`  | メインアプリ | `AppPage`      |
| `/god/*`  | 管理者領域   | `GodMode`      |

詳細は [frontend/src/App.tsx](../frontend/src/App.tsx) と [frontend/src/app/app.tsx](../frontend/src/app/app.tsx) を参照

## 認証フロー

- `AuthProvider` が Firebase Auth を監視
- ID トークンを取得し API クライアントに設定
- `GET /apiv1/user/me` でユーザープロファイルを取得
- メール未認証なら `/auth/verify` に誘導
- プロファイル未作成なら `/auth/setup` に誘導

実装は [frontend/src/authContext.tsx](../frontend/src/authContext.tsx)

## API クライアント

- バックエンドの Hono 型クライアントを利用
- ベース URL は `VITE_API_BASE_URL` または `VITE_API_URL`

実装は [frontend/src/lib/api/api.ts](../frontend/src/lib/api/api.ts)

## 画面構成の概要

### Auth 領域

- [frontend/src/auth/auth.tsx](../frontend/src/auth/auth.tsx)
- ログイン、登録、リセット、メール確認、初期セットアップ

### App 領域

- [frontend/src/app/app.tsx](../frontend/src/app/app.tsx)
- ヘッダー + コンテンツのレイアウト
- ロールによりホーム画面を切り替え

### God 領域

- [frontend/src/god/god.tsx](../frontend/src/god/god.tsx)
- `auth.isGod` が true のユーザーのみアクセス可能

## 状態管理

- 主要状態は `AuthContext` に集約
- 画面固有の状態は各コンポーネント内で管理

## エラーハンドリング

- `raiseError` で通知を集約
- `ErrorProvider` が UI トーストを表示

実装は [frontend/src/errorHandler.tsx](../frontend/src/errorHandler.tsx)
