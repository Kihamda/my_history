# My History of Scouting エージェントガイド

このファイルは、Codex、GitHub Copilot、そのほかのAIコーディングエージェントが共通で参照する規約です。
ツール固有の指示ファイルには、この内容を複製せず、このファイルへの参照だけを置きます。

## 判断の基準

- コードと設定を一次資料とし、近くの実装を読んでから変更します。
- 依存関係は各 `package.json` と `package-lock.json`、配信は `wrangler.jsonc` と GitHub Actions、データ形式は Zod スキーマを確認します。
- 局所的な修正では、UI、ルーティング、保存形式、配信手順を同時に再設計しません。
- 調査または文書整理の依頼では、明示されていない実装修正を行いません。
- 既存のヘルパーと部品を優先し、重複を実際に減らせる場合だけ抽象化を追加します。

## リポジトリの構成

- `frontend/`：React SPA
- `backend/`：Cloudflare Workers、Hono API、静的ファイル配信
- `staticSiteMarger/`：ランディングページとヘルプの静的生成

配信物は `frontend/dist/`、`staticSiteMarger`、`backend/buildTmp/` の順に組み立てます。
API の基準パスは `/apiv1/` です。

`staticSiteMarger`、`apiRotuer.ts`、`fullscreanPopup`、`imputGroupUI`、`scoutTransfar` は既存参照を持つ名称です。
改名する場合は、参照、公開パス、文書を同じ変更で更新します。

## バックエンド

- Hono ルートでは `zValidator` を使い、入力を `c.req.valid()` から取得します。
- Firestore は `db()` と `backend/src/lib/firestore/` の Operator を通して操作します。
- 認証の順序は Firestore の準備、Firebase ID トークン検証、User データ読み込み、ドメイン別ルートです。
- 認可は User の `auth.memberships` と `auth.shares` を基準にし、Group ドキュメントへメンバー一覧を追加しません。
- 想定内のAPI失敗は `HTTPException` とJSONメッセージで返します。
- Firestore の保存形式は `backend/src/lib/firestore/schemas.ts`、API固有の形式は担当ルートまたはハンドラーに置きます。
- バックエンドの import には `@b/*` を使います。

## フロントエンド

- API は `frontend/src/lib/api/api.ts` の型付き Hono クライアントから呼び出します。
- サーバー状態には React Query を使い、結果を変える利用者、ID、検索条件をクエリキーに含めます。
- 認証必須の画面では `useAuthContext(true)`、グループ必須の処理では `useCurrentGroup()` を使います。
- 利用者への成功と失敗は `raiseError()` で通知します。
- フロントエンドの import には `@f/*` と `@b/*` を使います。

通常画面のUI基盤は Bootstrap と react-bootstrap です。
ボタン、フォーム、InputGroup、Card は標準部品を使い、通常画面だけ別の色、角丸、余白体系へ置き換えません。
ログイン、設定、検索、編集画面に、装飾目的の指標、マーケティング文、ダッシュボードカードを追加しません。

## 静的サイトと配信

- ランディングページとヘルプは React の `renderToString` と `template.html` で生成します。
- 利用者向けヘルプは `staticSiteMarger/help/pages/` の Markdown を更新します。
- `/app/*`、`/auth/*`、`/god/*` は Workers から `spa.html` を返します。
- 静的ページを変更した場合は、SPAを先にビルドしてから静的生成を確認します。

## 文書と既知問題

- 現在の仕様は `docs/architecture.md`、`api.md`、`data-model.md`、`security.md` に記載します。
- 既知の問題と改善予定は `docs/roadmap.md` だけで管理します。
- 公開リポジトリの文書には、脆弱性の再現手順、悪用方法、不要な内部詳細を記載しません。
- 新しい問題を確認した場合は、実装修正が依頼範囲に含まれるかを確認し、含まれない場合は `roadmap.md` に抽象化した改善項目だけを追加します。
- 挙動、API、データ形式を変更した場合は、対応する設計資料と `docs/changelog.md` を同じ変更で更新します。
- AIエージェント向け規約を変更する場合は、この `AGENTS.md` を更新し、ツール固有ファイルへ本文を複製しません。

## 検証

| 変更範囲 | コマンド |
| --- | --- |
| `frontend/` | `npm run build` |
| `backend/` | `npm run typecheck` |
| Workerまたは配信 | `npm run dry-run` |
| `staticSiteMarger/` | `npm run test` |
| 全体 | ルートの `build.bat` |

依存関係、Secret、権限、サンドボックスの制約で実行できない場合は、未実行のコマンドと理由を報告します。
