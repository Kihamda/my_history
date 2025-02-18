import { Link, Navigate, Route, Routes } from "react-router-dom";
import FillBackgroundDesign from "../common/style/fillBackgroundDesign";
import BlurCard from "../common/style/cardDesign";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

import Registar from "./Registar/registar";
import Reset from "./Reset/reset";

/**
 * `Auth`コンポーネントは認証ルートとホームページに戻るリンクをレンダリングします。
 * `FillBackgroundDesign`コンポーネントを使用して、背景画像を設定し、ビューポートの高さを埋めます。
 *
 * ルート:
 * - `/` は `/auth/login` にリダイレクトします
 * - `/registar` は空の要素をレンダリングします
 * - `/signin` は空の要素をレンダリングします
 * - `/reset` は空の要素をレンダリングします
 *
 * ホームリンクはビューポートの左上隅に絶対位置で配置されます。
 *
 * @returns {JSX.Element} レンダリングされた認証コンポーネント。
 */

const Auth = () => {
  return (
    <FillBackgroundDesign
      className="vh-100"
      backgroundImagePath="/assets/auth/bg.webp"
    >
      <Routes>
        <Route path="/" element={<Navigate to={"/auth/login"} />} />
        <Route path="/registar" element={<Registar />} />
        <Route path="/signin" element={<></>} />
        <Route path="/reset" element={<Reset />} />
      </Routes>
      <Link
        to="/"
        className="position-absolute"
        style={{
          top: "1%",
          left: "1%",
          textDecoration: "none",
        }}
      >
        <BlurCard
          style={{
            padding: "0.5rem 1rem",
          }}
        >
          <FontAwesomeIcon icon={faHouseChimney} className="me-2" />
          ホームに戻る
        </BlurCard>
      </Link>
    </FillBackgroundDesign>
  );
};

export default Auth;
