# 技術スタック

最終更新：2026-11-03

次のバージョンは、各 `package-lock.json` で現在解決されている値です。
`package.json` にはキャレット付きの範囲指定があるため、依存関係を更新した場合はこの表も確認します。

## フロントエンド

| 用途 | パッケージ | バージョン |
| --- | --- | --- |
| UI | React / React DOM | 19.3.1 |
| ルーティング | React Router | 8.5.1 |
| サーバー状態 | TanStack React Query | 5.105.3 |
| ビルド | Vite | 8.3.5 |
| 言語 | TypeScript | 7.0.2 |
| UI 基盤 | Bootstrap / react-bootstrap | 5.3.8 / 2.10.10 |
| 認証 | Firebase JavaScript SDK | 13.2.0 |
| アイコン | Font Awesome core / React | 7.3.1 / 3.5.0 |
| 管理画面 | json-edit-react | 2.0.5 |

Vite の React 変換には `@vitejs/plugin-react-swc` を使います。
かつて使っていた `rolldown-vite` ではありません。
フロントエンドの型チェックは `typescript-7` という別名でインストールした TypeScript 7 を使います。ESLint の解析には、typescript-eslint の対応範囲に含まれる TypeScript 6 を使います。

## バックエンド

| 用途 | パッケージまたは環境 | バージョン |
| --- | --- | --- |
| 実行環境 | Cloudflare Workers | `compatibility_date` 2025-09-25 |
| Web フレームワーク | Hono | 4.13.16 |
| 入力検証 | Zod | 4.6.7 |
| Hono 連携 | @hono/zod-validator | 0.9.1 |
| Firebase トークン検証 | firebase-auth-cloudflare-workers | 2.0.6 |
| Firestore REST | firebase-rest-firestore | 1.6.4 |
| 言語 | TypeScript | 7.0.2 |
| 開発とデプロイ | Wrangler | 4.157.0 |

バックエンドでは、間接依存の `undici` を 7.30.1 に固定しています。

## 静的サイト生成

| 用途 | パッケージ | バージョン |
| --- | --- | --- |
| SSR | React / React DOM | 19.3.1 |
| UI 基盤 | react-bootstrap | 2.10.10 |
| Markdown | marked | 18.1.3 |
| TypeScript 実行 | tsx | 4.23.15 |
| 言語 | TypeScript | 7.0.2 |

## 開発環境

GitHub Actions とローカルの基準は Node.js 26 系です。
三つのプロジェクトは独立した `package.json` と `package-lock.json` を持つため、それぞれで `npm ci` または `npm install` を実行します。
