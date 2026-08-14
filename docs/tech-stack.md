# 技術スタック

最終更新：2026-08-14

次のバージョンは、各 `package-lock.json` で現在解決されている値です。
`package.json` にはキャレット付きの範囲指定があるため、依存関係を更新した場合はこの表も確認します。

## フロントエンド

| 用途 | パッケージ | バージョン |
| --- | --- | --- |
| UI | React / React DOM | 19.2.8 |
| ルーティング | React Router | 8.3.0 |
| サーバー状態 | TanStack React Query | 5.99.0 |
| ビルド | Vite | 8.2.0 |
| 言語 | TypeScript | 6.0.2 |
| UI 基盤 | Bootstrap / react-bootstrap | 5.3.8 / 2.10.10 |
| 認証 | Firebase JavaScript SDK | 12.12.0 |
| アイコン | Font Awesome core / React | 7.2.0 / 3.3.0 |
| 管理画面 | json-edit-react | 1.29.0 |

Vite の React 変換には `@vitejs/plugin-react-swc` を使います。
かつて使っていた `rolldown-vite` ではありません。

## バックエンド

| 用途 | パッケージまたは環境 | バージョン |
| --- | --- | --- |
| 実行環境 | Cloudflare Workers | `compatibility_date` 2025-09-25 |
| Web フレームワーク | Hono | 4.13.0 |
| 入力検証 | Zod | 4.3.6 |
| Hono 連携 | @hono/zod-validator | 0.7.6 |
| Firebase トークン検証 | firebase-auth-cloudflare-workers | 2.0.6 |
| Firestore REST | firebase-rest-firestore | 1.5.0 |
| 言語 | TypeScript | 6.0.2 |
| 開発とデプロイ | Wrangler | 4.118.0 |

バックエンドでは、間接依存の `undici` を 7.29.0 に固定しています。

## 静的サイト生成

| 用途 | パッケージ | バージョン |
| --- | --- | --- |
| SSR | React / React DOM | 19.2.5 |
| UI 基盤 | react-bootstrap | 2.10.10 |
| Markdown | marked | 18.0.9 |
| TypeScript 実行 | tsx | 4.23.6 |
| 言語 | TypeScript | 6.0.2 |

## 開発環境

GitHub Actions とローカルの基準は Node.js 22 です。
三つのプロジェクトは独立した `package.json` と `package-lock.json` を持つため、それぞれで `npm ci` または `npm install` を実行します。
