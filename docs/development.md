# 開発ガイド

最終更新：2026-08-14

実装を変更するときは、近くのコードと設定を一次資料にし、既存の公開パス、保存形式、UI 基盤を保ちます。

## 作業単位

三つのプロジェクトは独立しているため、変更した範囲に応じて検証します。

| 変更範囲 | 最低限の検証 |
| --- | --- |
| `frontend/` | `npm run build` |
| `backend/` | `npm run typecheck` と `npm run dry-run` |
| `staticSiteMarger/` | `npm run test` |
| 配信成果物または複数領域 | ルートの `build.bat` |

フロントエンドの `build` は TypeScript project build、ESLint、Vite build を順に実行します。
検証基盤の改善予定は [roadmap.md](roadmap.md) で管理します。

## バックエンドの実装

API 入力はルートで `zValidator` を使って検証し、検証済みの値を `c.req.valid()` から取得します。
永続データの構造は `backend/src/lib/firestore/schemas.ts`、HTTP 固有の構造は各ルートまたはハンドラーに定義します。

認可はデータ取得後の所属先を基準に確認します。
要求パラメーターのグループ ID だけで判断せず、Scout の `belongGroupId` や対象 User の保存値と照合します。

想定内の失敗は `HTTPException` で表し、クライアントへ返すメッセージを指定します。
Firestore は `db().users`、`db().groups`、`db().scouts` を通して操作します。

`set` は全体置換です。
既存値を展開して一部だけ変える処理では、同時更新による上書きが許容できるかを確認し、許容できない配列更新にはトランザクションまたは原子的な更新方法を選びます。

非同期の繰り返しでは、応答前に必要な処理をすべて待機し、失敗を呼び出し元へ返します。

## フロントエンドの実装

サーバーから取得する状態と変更処理には React Query を使います。
クエリキーには、結果を変える ID、検索条件、ユーザー境界を含めます。
ログアウトでは全キャッシュを消去し、更新後は影響するキーだけを無効化または削除します。

HTTP 呼び出しは `frontend/src/lib/api/api.ts` の Hono クライアントと `apiJson` を使います。
API エラーは QueryClient の共通ハンドラーが利用者へ通知します。

通常画面は Bootstrap と react-bootstrap の部品を使います。
ボタンやフォームを独自の色、角丸、余白で別のデザイン体系に置き換えません。

## パスと命名

バックエンドは `@b/*`、フロントエンドは `@f/*` と `@b/*` を使います。
長い相対 import を追加しません。

`staticSiteMarger`、`apiRotuer.ts`、`fullscreanPopup`、`imputGroupUI`、`scoutTransfar` は既存参照を持つ名称です。
改名する場合は、参照、公開パス、文書を同じ変更で更新します。

## 文書の更新

API、データ、認可の変更は、コードだけで完結しません。
変更した契約に対応する [api.md](api.md)、[data-model.md](data-model.md)、[security.md](security.md) を同じ作業で更新します。

依存関係を更新した場合は、各 lockfile の解決値を [tech-stack.md](tech-stack.md) へ反映します。
利用者の操作や表示が変わる場合は、`staticSiteMarger/help/pages/` のヘルプも更新します。
