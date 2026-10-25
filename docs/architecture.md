# アーキテクチャ

最終更新：2026-08-14

My History of Scouting は、ボーイスカウト活動の進歩、技能章、行事、所属と共有権限を管理する Web アプリケーションです。
一つの Cloudflare Worker が API、静的ページ、SPA の配信を担当し、永続データは Cloud Firestore、利用者認証は Firebase Authentication が担当します。

## 三つのデプロイ対象

```text
ブラウザ
  |
  | HTTPS
  v
Cloudflare Workers + Hono
  |-- /apiv1/*   JSON API
  |-- /          静的ランディングページ
  |-- /help/*    静的ヘルプ
  |-- /app/*     React SPA
  |-- /auth/*    React SPA
  `-- /god/*     React SPA
  |
  |-- Firebase ID token の検証
  `-- Firestore REST API
```

リポジトリには、次の三つの Node.js プロジェクトがあります。

| ディレクトリ | 責務 | 主な出力 |
| --- | --- | --- |
| `frontend/` | 認証画面、通常画面、God モード画面 | `frontend/dist/` |
| `staticSiteMarger/` | ランディングページとヘルプを静的 HTML に変換 | `staticSiteMarger/dist/` |
| `backend/` | API と最終成果物の配信 | Worker と `backend/buildTmp/` |

## API リクエストの流れ

`/apiv1/*` では、最初に Firestore クライアントを準備し、次に Firebase ID トークンを検証します。
`POST /apiv1/user/createUser` 以外のユーザー API と、Scout、Group、God の各 API は、Firestore の User ドキュメントも読み込んでから処理します。

```text
リクエスト
  -> CORS
  -> firestoreMiddleware
  -> authorize
  -> user/createUser または loadUserData
  -> ドメイン別ルート
  -> db().users / groups / scouts
  -> JSON レスポンス
```

本番環境はクロスオリジン要求を許可せず、開発環境で `IS_DEV` が `TRUE` の場合だけ CORS のオリジンを `*` にします。

## 認証と画面状態の流れ

フロントエンドは Firebase Authentication の状態変化を監視し、ID トークンを Hono の型付きクライアントへ設定します。
その後、`GET /apiv1/user/me` からプロフィール、所属、招待、共有を取得します。
トークンは 10 分ごとに更新し、ログアウト時には React Query のキャッシュを消去します。

## データの所有関係

Scout ドキュメントは `belongGroupId` で Group を参照します。
一方、Group ドキュメントにはメンバー一覧を保存せず、User の `auth.memberships` に `ROLE;groupId` 形式で所属を保存します。
招待も User の `auth.invites`、スカウト単位の共有も User の `auth.shares` に保存します。

この分散配置では、メンバー、招待、共有の変更が User ドキュメントの読み書きになります。

## 静的成果物の流れ

```text
frontend のビルド
  -> frontend/dist/index.html
staticSiteMarger のビルド
  -> SPA の index.html を spa.html として保持
  -> ランディングページを index.html に配置
  -> help/*.html と画像を結合
  -> backend/buildTmp/ へコピー
Wrangler
  -> buildTmp を ASSETS バインディングで配信
```

ビルド順は `frontend`、`staticSiteMarger`、`backend` です。
ローカルの `build.bat` と GitHub Actions は、この順序で実行します。
