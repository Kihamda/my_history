import { Link, Navigate, Route, Routes } from "react-router-dom";
import FillBackgroundDesign from "@/style/fillBackgroundDesign";
import BlurCard from "@/style/cardDesign";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

import Register from "./Register/register";
import Reset from "./Reset/reset";
import Signin from "./Signin/signin";
import MoveCard from "./moveCard";
import { useAuthContext } from "@/firebase/authContext";

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
  // ユーザーの認証状態を取得
  const { user } = useAuthContext();

  //ログインしているのにもう一回ログインしようとした人を/appに送る
  if (user) {
    return <Navigate to="/app" />;
  }

  return (
    <FillBackgroundDesign
      className="vh-100"
      backgroundImagePath="/assets/auth/bg.webp"
    >
      <div className="row w-100">
        <BlurCard className="col-10 col-md-6 col-lg-4 mx-auto">
          <Routes>
            <Route path="/*" element={<Navigate to={"/auth/login"} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/reset" element={<Reset />} />
          </Routes>
        </BlurCard>
      </div>
      <div>
        <MoveCard />
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
      </div>
    </FillBackgroundDesign>
  );
};

export default Auth;
