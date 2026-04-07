# フロントエンド

## エントリーポイント

- [frontend/src/main.tsx](../frontend/src/main.tsx) - React アプリ起動
- [frontend/src/App.tsx](../frontend/src/App.tsx) - ルートコンポーネント

`main.tsx` が `BrowserRouter` でラップし、`App.tsx` がルーティングを担う

## ルーティング構成

| パス      | 役割           | コンポーネント       | 備考                           |
| --------- | -------------- | -------------------- | ------------------------------ |
| `/`       | リロード誘導   | `Reload`             | レース条件回避                 |
| `/auth/*` | 認証領域       | `Auth`               | login, register, verify, setup |
| `/app/*`  | メインアプリ   | `AppPage`            | スカウト管理、設定             |
| `/god/*`  | 管理者領域     | `GodMode`            | isGod ユーザーのみ             |
| `*`       | 404            | `NotFound`           |                                |

詳細は [frontend/src/App.tsx](../frontend/src/App.tsx) を参照

## 認証フロー

1. `AuthProvider` が Firebase Auth を `onAuthStateChanged` で監視
2. ログイン検出で ID トークンを取得 (`getIdToken`)
3. `setHcClient(token)` で API クライアントを設定
4. `GET /apiv1/user/me` でユーザープロファイルを取得
5. メール未認証なら `/auth/verify` に誘導
6. プロファイル未作成なら `/auth/setup` に誘導
7. トークンは 10 分ごとに自動更新

実装は [frontend/src/authContext.tsx](../frontend/src/authContext.tsx)

### Firebase Auth メソッド

- `createUserWithEmailAndPassword` - 新規登録
- `signInWithEmailAndPassword` - ログイン
- `signOut` - ログアウト
- `sendEmailVerification` - メール認証送信
- `sendPasswordResetEmail` - パスワードリセット
- `getIdToken` - トークン取得

## API クライアント

- バックエンドの Hono 型クライアント (`hc`) を利用
- ベース URL は `VITE_API_URL` (デフォルト: `/`)
- `@b/client` からインポートして型安全に呼び出し

実装は [frontend/src/lib/api/api.ts](../frontend/src/lib/api/api.ts)

## 画面構成

### Auth 領域 (`/auth/*`)

| ルート    | コンポーネント | 機能               |
| --------- | -------------- | ------------------ |
| `/login`  | `Signin`       | ログイン           |
| `/register` | `Register`   | 新規登録           |
| `/verify` | `VerifyEmail`  | メール認証待ち     |
| `/setup`  | `Setup`        | 初期プロファイル   |
| `/reset`  | `Reset`        | パスワードリセット |

実装は [frontend/src/auth/](../frontend/src/auth/)

### App 領域 (`/app/*`)

| ルート          | コンポーネント    | 機能               |
| --------------- | ----------------- | ------------------ |
| `/home`         | `LeaderHome`/`VisitorHome` | ホーム (ロール別) |
| `/scouts`       | `ScoutsPage`      | スカウト検索       |
| `/scouts/:id`   | `ScoutDetail`     | スカウト詳細/編集  |
| `/scouts/new`   | `NewScoutWizard`  | 新規スカウト作成   |
| `/group/*`      | `GroupPage`       | グループ管理       |
| `/setting/*`    | `SettingPage`     | ユーザー設定       |

実装は [frontend/src/app/](../frontend/src/app/)

### God 領域 (`/god/*`)

| ルート          | コンポーネント | 機能               |
| --------------- | -------------- | ------------------ |
| `/home`         | `GodHome`      | 管理者ダッシュボード |
| `/scouts`       | `ScoutPage`    | スカウト検索/編集  |
| `/scouts-batch` | `CreateScoutBatPage` | 一括作成     |
| `/group`        | `GroupPage`    | グループ管理       |
| `/user`         | `UserPage`     | ユーザー検索       |

実装は [frontend/src/god/](../frontend/src/god/)

## 状態管理

### Context API

- `AuthContext` - 認証状態、ユーザー情報、現在のグループ
- `PopupContext` - フルスクリーンポップアップ制御
- `ErrorProvider` - エラー通知

### ブラウザストレージ

- `localStorage`
  - `darkMode` - ダークモード設定
  - `currentGroupSlotId` - 選択中のグループ
  - 検索クエリキャッシュ
- `sessionStorage`
  - 検索結果キャッシュ

実装は [frontend/src/lib/localCache.ts](../frontend/src/lib/localCache.ts)

## コード分割

- すべてのルートコンポーネントは `React.lazy()` で遅延読み込み
- `Suspense` でローディング表示
- バンドル分割: react, react-router, firebase, vendor

## エラーハンドリング

- `raiseError(message, level, trace)` で通知を発火
- `ErrorProvider` が `CustomEvent` をリッスンして Toast 表示
- 開発モードではスタックトレースを表示
- 5 秒後に自動消去

実装は [frontend/src/errorHandler.tsx](../frontend/src/errorHandler.tsx)
