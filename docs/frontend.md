# フロントエンド

最終更新：2026-08-14

フロントエンドは React、React Router、Bootstrap、TanStack React Query で構成する SPA です。
`frontend/src/main.tsx` が共通 Provider を組み立て、`frontend/src/App.tsx` が認証、通常画面、God モードを振り分けます。

## Provider の構成

```text
StrictMode
  -> QueryClientProvider
  -> BrowserRouter
  -> ErrorProvider
  -> AuthProvider
  -> PopupProvider
  -> Routes
```

`ErrorProvider` は通知を表示し、`AuthProvider` は Firebase ユーザー、API トークン、User API の結果、選択中グループを管理します。
`PopupProvider` は共有ユーザー検索などの全画面ポップアップを管理します。

## ルーティング

| パス | 役割 |
| --- | --- |
| `/auth/login` | ログイン |
| `/auth/register` | アカウント作成 |
| `/auth/reset` | パスワード再設定 |
| `/auth/verify` | メール確認 |
| `/auth/setup` | 初期プロフィール作成 |
| `/app/home` | 所属中ユーザーまたは共有のみのユーザーのホーム |
| `/app/scouts` | 所属グループ内のスカウト検索 |
| `/app/scouts/new` | スカウト作成 |
| `/app/scouts/:id` | スカウト表示と編集 |
| `/app/group/*` | グループ設定、メンバー、招待 |
| `/app/setting/*` | プロフィール、所属、受信中の招待 |
| `/god/home` | God モードの環境表示 |
| `/god/scouts` | 全スカウトの検索と直接編集 |
| `/god/scouts-batch` | スカウトの一括登録 |
| `/god/group` | 全グループの検索と直接編集 |
| `/god/user` | 全ユーザーの検索と直接編集 |

Workers は `/app/*`、`/auth/*`、`/god/*` に同じ `spa.html` を返し、その後の画面遷移を React Router が処理します。

## 認証状態

`AuthProvider` は `onAuthStateChanged` で Firebase Authentication を監視します。
ログイン時は強制更新した ID トークンで Hono クライアントを作り、`["current-user", uid]` のクエリで `GET /apiv1/user/me` を呼びます。
ログアウト時は API クライアントからトークンを外し、React Query の全キャッシュを消去します。

トークンは 10 分ごとに取り直します。
メール未確認の利用者は認証画面、User ドキュメントが未作成の利用者は初期設定画面へ誘導されます。

## API とサーバー状態

`frontend/src/lib/api/api.ts` は、`backend/src/client.ts` から生成した Hono の型付きクライアントを公開します。
API の基準 URL は `VITE_API_URL` で、未指定時は `/` です。

React Query はユーザー、共有スカウト、検索結果、スカウト詳細、グループ設定、メンバー、招待、God モードの検索結果を保持します。
既定値は再試行なし、`staleTime` 30 秒、ウィンドウフォーカス時の再取得なしです。

## ブラウザ保存

`frontend/src/lib/localCache.ts` は `localStorage` に次の値を保存します。

- `currentGroupSlotId`：現在選択しているグループ
- `darkMode`：画面設定として残っている値
- `searchQueryCache:<groupId>`：グループ別の検索条件

現在の実装は `sessionStorage` を使っていません。
サーバーから取得したデータは React Query に置き、ログアウト時に破棄します。

## UI の方針

通常画面は Bootstrap と react-bootstrap を基盤にします。
ボタン、フォーム、カードは Bootstrap の標準部品を使い、独自 CSS は配置や既存画面固有の表現に限定します。
ルート単位の主要コンポーネントは `React.lazy` と `Suspense` で遅延読み込みします。
