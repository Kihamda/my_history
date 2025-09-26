import { Link, useLocation } from "react-router";
import BlurCard from "../style/cardDesign";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

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

  let links = [
    { path: "/auth/login", text: "ログインはこちら" },
    { path: "/auth/register", text: "登録はこちら" },
    { path: "/auth/reset", text: "パスワードリセットはこちら" },
  ];

  // 現在のパスを除外
  links = links.filter((link) => link.path !== currentPath);

  return (
    <div className="position-absolute" style={{ bottom: "1%", right: "1%" }}>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          style={{
            textDecoration: "none",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          <BlurCard
            style={{
              padding: "0.5rem 1rem",
            }}
          >
            <FontAwesomeIcon icon={faArrowRight} className="me-2" />
            {link.text}
          </BlurCard>
        </Link>
      ))}
    </div>
  );
};

export default MoveCard;
