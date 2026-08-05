import { Link, useLocation } from "react-router";

/**
 * `MoveCard`コンポーネントは現在のURLを取得し、他の場所に誘導するリンクを表示します。
 * 現在のURLが`/auth/login`の場合、`/auth/registar`と`/auth/reset-password`に誘導します。
 * 現在のURLが`/auth/registar`の場合、`/auth/login`と`/auth/reset-password`に誘導します。
 * 現在のURLが`/auth/reset-password`の場合、`/auth/login`と`/auth/registar`に誘導します。
 *
 * @returns {JSX.Element} レンダリングされた移動カードコンポーネント。
 */

const MoveCard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { path: "/auth/login", text: "ログイン" },
    { path: "/auth/register", text: "新規登録" },
    { path: "/auth/reset", text: "再設定" },
  ];

  if (!links.some((link) => link.path === currentPath)) {
    return null;
  }

  return (
    <nav className="nav nav-pills nav-fill gap-2 mb-2" aria-label="認証画面">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`nav-link ${link.path === currentPath ? "active" : ""}`}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
};

export default MoveCard;
