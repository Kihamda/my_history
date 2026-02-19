import React from "react";
import { renderToString } from "react-dom/server";

const articles = [
  {
    href: "/help/getting-started.html",
    title: "はじめに",
    desc: "最初の設定と利用開始までの流れ",
  },
  {
    href: "/help/account-and-auth.html",
    title: "アカウントとログイン",
    desc: "メール認証とプロフィール設定",
  },
  {
    href: "/help/scout-management.html",
    title: "スカウト情報の管理",
    desc: "検索 作成 更新 削除と必要権限",
  },
  {
    href: "/help/permissions-and-invites.html",
    title: "権限と招待",
    desc: "VIEW EDIT ADMIN の違いと運用",
  },
  {
    href: "/help/faq.html",
    title: "よくある質問",
    desc: "困った時の一次切り分け",
  },
] as const;

const Help = (): React.JSX.Element => {
  return (
    <div className="container py-4">
      <h1 className="mb-3">利用者ヘルプ</h1>
      <p className="text-secondary mb-4">
        操作で困った時は まず下のページから該当項目を開いてください
      </p>

      <div className="list-group">
        {articles.map((article) => (
          <a
            key={article.href}
            className="list-group-item list-group-item-action"
            href={article.href}
          >
            <div className="fw-semibold">{article.title}</div>
            <small className="text-secondary">{article.desc}</small>
          </a>
        ))}
      </div>

      <p className="text-secondary small mt-4 mb-0">最終更新 2026-02-20</p>
    </div>
  );
};

const getStartingHTML = (): string => {
  const html = renderToString(<Help />);
  return html;
};

export default getStartingHTML;
