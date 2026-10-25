# 静的サイト生成

最終更新：2026-08-14

`staticSiteMarger/` は、ランディングページと利用者ヘルプをビルド時に HTML へ変換し、Vite が生成した SPA と結合します。
このディレクトリ名は既存のビルド手順に組み込まれているため、そのまま使います。

## 生成する内容

ランディングページは React コンポーネントを `renderToString` で HTML に変換します。
画面は Header、トップ、概要、機能、利用フロー、信頼性情報、モバイル用 CTA で構成します。

ヘルプの索引は React で生成し、各記事は `staticSiteMarger/help/pages/*.md` を marked で HTML に変換します。
索引からリンクする記事は、はじめに、アカウントとログイン、スカウト管理、権限と招待、FAQ の 5 件です。

## 主要ファイル

| ファイル | 責務 |
| --- | --- |
| `build.ts` | 他プロジェクトへのコピーを含む本番生成 |
| `test.ts` | コピーを行わない生成確認 |
| `lib/main.ts` | 出力ディレクトリ、生成、コピーの制御 |
| `lib/builder.ts` | React SSR、Markdown 変換、テンプレート適用 |
| `landing/landing.tsx` | ランディングページ |
| `help/help.tsx` | ヘルプ索引 |
| `help/article.tsx` | ヘルプ記事の外枠 |
| `template.html` | 共通 HTML テンプレート |

## 出力の流れ

```text
staticSiteMarger/dist/
  index.html
  help/index.html
  help/*.html
  landing/*.webp
        |
        v
frontend/dist/
  index.html       ランディングページ
  spa.html         Vite が作った旧 index.html
  help/*.html
  assets/*
        |
        v
backend/buildTmp/
```

`staticSiteMarger` は、`frontend/dist/spa.html` がまだない場合だけ Vite の `index.html` をコピーします。
その後、Vite の `index.html` を削除し、静的サイトの `index.html` を配置します。

## コマンド

コピーを行わずに静的生成だけを確認します。

```powershell
Set-Location staticSiteMarger
npm run test
```

SPA と結合し、Workers の配信ディレクトリまでコピーします。

```powershell
Set-Location frontend
npm run build
Set-Location ../staticSiteMarger
npm run build
Set-Location ../backend
npm run dry-run
```

`frontend` を先にビルドしなければ、結合対象の SPA が存在しません。
ルートの `build.bat` はこの順序を固定しています。
