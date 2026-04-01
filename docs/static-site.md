# 静的サイト生成

## 目的

- ランディングページとヘルプを静的 HTML で配信
- SPA と切り分けて高速配信する
- SEO フレンドリーなコンテンツ配信

## 実装

- [staticSiteMarger/](../staticSiteMarger/) が担当
- React を `renderToString` で SSR
- `template.html` に差し込んで `dist` へ出力

### 主要ファイル

| ファイル                   | 役割                     |
| -------------------------- | ------------------------ |
| `build.ts`                 | ビルドエントリーポイント |
| `lib/main.ts`              | ビルドオーケストレーション |
| `lib/builder.ts`           | HTML 生成ロジック        |
| `landing/landing.tsx`      | ランディングページ       |
| `help/help.tsx`            | ヘルプインデックス       |
| `help/article.tsx`         | ヘルプ記事テンプレート   |
| `help/pages/*.md`          | ヘルプ記事 (Markdown)    |
| `template.html`            | HTML テンプレート        |

## 生成ページ

### ランディング (`/`)

React コンポーネントを SSR して生成

**セクション構成:**
1. Header - ナビゲーション
2. Hero (LandTop) - フルスクリーンヒーロー
3. About - アプリ説明
4. Features - 機能紹介
5. Flow - 利用フロー
6. Trust - 信頼性情報
7. Mobile CTA - モバイル用フローティングボタン

### ヘルプ (`/help/*`)

Markdown から HTML に変換

**記事一覧:**
| スラッグ                  | タイトル           |
| ------------------------- | ------------------ |
| `getting-started`         | はじめに           |
| `account-and-auth`        | アカウントと認証   |
| `scout-management`        | スカウト管理       |
| `permissions-and-invites` | 権限と招待         |
| `faq`                     | よくある質問       |

## 出力フロー

```
1. staticSiteMarger/
   ├─ landing/*.tsx  ─→ renderToString ─→ index.html
   ├─ help/pages/*.md ─→ marked ─→ help/*.html
   └─ public/ ─────────────────→ assets/

2. staticSiteMarger/dist/
   ├─ index.html (Landing)
   ├─ help/index.html
   ├─ help/{slug}.html
   └─ assets/

3. [copyToDist]
   frontend/dist/
   ├─ index.html (Landing)     ← from staticSiteMarger
   ├─ spa.html (SPA)           ← 旧 index.html を退避
   ├─ help/*.html
   └─ assets/

4. [copyToBackend]
   backend/buildTmp/
   └─ (frontend/dist/ の完全コピー)
```

## ビルドコマンド

```bash
cd staticSiteMarger
npm run build    # 本番ビルド (copy steps 実行)
npm run test     # テストビルド (copy steps スキップ)
```

## 配信

Workers が `backend/buildTmp/` を静的配信

| パス         | 配信ファイル | 備考                      |
| ------------ | ------------ | ------------------------- |
| `/`          | `index.html` | Landing (静的生成)        |
| `/help/*`    | `help/*.html`| Help (静的生成)           |
| `/app/*`     | `spa.html`   | SPA (React Router)        |
| `/auth/*`    | `spa.html`   | SPA (React Router)        |
| `/god/*`     | `spa.html`   | SPA (React Router)        |
| `/assets/*`  | 各種静的ファイル | CSS, JS, 画像など      |

## ビルド順序

**重要: ビルド順序を守ること**

```bash
1. cd frontend && npm run build     # SPA を frontend/dist に出力
2. cd staticSiteMarger && npm run build  # 静的ページを生成してマージ
3. cd backend && npm run deploy     # buildTmp をデプロイ
```

- フロントエンドが先にビルドされている必要がある
- staticSiteMarger は frontend/dist の index.html を spa.html に退避
- backend は最終的な buildTmp をデプロイ
