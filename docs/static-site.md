# 静的サイト生成

## 目的

- ランディングページとヘルプを静的 HTML で配信
- SPA と切り分けて高速配信する

## 実装

- [staticSiteMarger/](../staticSiteMarger/) が担当
- React を `renderToString` で SSR
- `template.html` に差し込んで `dist` へ出力

主要ファイル

- [staticSiteMarger/build.ts](../staticSiteMarger/build.ts)
- [staticSiteMarger/lib/main.ts](../staticSiteMarger/lib/main.ts)
- [staticSiteMarger/lib/builder.ts](../staticSiteMarger/lib/builder.ts)
- [staticSiteMarger/landing/landing.tsx](../staticSiteMarger/landing/landing.tsx)

## 出力フロー

1. `staticSiteMarger/dist` に HTML を生成
2. `frontend/dist` にコピー
3. `backend/buildTmp` にコピー

## 配信

- Workers が `buildTmp` を静的配信
- `/` は Landing の `index.html`
- `/app/*` と `/auth/*` と `/god/*` は SPA 用 `spa.html`
