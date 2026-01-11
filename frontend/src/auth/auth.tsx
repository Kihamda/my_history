import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

import BlurCard from "@f/style/cardDesign";
import FillBackgroundDesign from "@f/style/fillBackgroundDesign";
import { useAuthContext } from "@f/authContext";

import Register from "./Register/register";
import Reset from "./Reset/reset";
import Signin from "./Signin/signin";
import MoveCard from "./moveCard";
import VerifyEmail from "./VerifyEmail/verifyEmail";
import Setup from "./Setup/setup";

/**
 * `Auth`コンポーネントは認証ルートとホームページに戻るリンクをレンダリングします。
 * `FillBackgroundDesign`コンポーネントを使用して、背景画像を設定し、ビューポートの高さを埋めます。
 *
 * ルート:
 * - `/register`: 登録画面
 * - `/login`: ログイン画面（デフォルト）
 * - `/reset`: パスワードリセット画面
 * - `/verify`: メール確認画面
 * - `/setup`: 初期セットアップ画面
 *
 * 認証状態に応じたリダイレクト処理も行います。
 */
const Auth = () => {
  // ユーザーの認証状態を取得
  const context = useAuthContext();
  const location = useLocation();

  // ログイン済みユーザーのリダイレクト制御
  if (context?.token) {
    const { emailVerified } = context.token;
    const hasUserProfile = !!context.user;

    if (emailVerified) {
      if (hasUserProfile) {
        // メール認証済みかつユーザープロファイルあり -> アプリホームへ
        return <Navigate to="/app" replace />;
      }

      // メール認証済みだがユーザープロファイルなし -> セットアップ画面へ
      // ループ防止: 現在地がセットアップ画面でない場合のみリダイレクト
      if (location.pathname !== "/auth/setup") {
        return <Navigate to="/auth/setup" replace />;
      }
    } else {
      // メール未認証 -> 確認画面へ
      // ループ防止: 現在地が確認画面でない場合のみリダイレクト
      if (!location.pathname.startsWith("/auth/verify")) {
        return <Navigate to="/auth/verify" replace />;
      }
    }
  } else {
    // 未ログインユーザーの場合、認証ルート以外へのアクセスをログイン画面へリダイレクト
    if (
      !location.pathname.startsWith("/auth/login") &&
      !location.pathname.startsWith("/auth/register") &&
      !location.pathname.startsWith("/auth/reset")
    ) {
      return <Navigate to="/auth/login" replace />;
    }
  }

  return (
    <FillBackgroundDesign
      className="vh-100"
      backgroundImagePath="/spaAssets/auth/bg.webp"
    >
      <div className="row w-100">
        <BlurCard className="col-10 col-md-6 col-lg-4 mx-auto">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/setup" element={<Setup />} />
            {/* 未定義のパスはログインへリダイレクト */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </BlurCard>
      </div>
      <div>
        <MoveCard />
        <Link
          to="/"
          className="position-absolute text-decoration-none top-0 start-0 m-3"
        >
          <BlurCard className="px-3 py-2">
            <FontAwesomeIcon icon={faHouseChimney} className="me-2" />
            ホームに戻る
          </BlurCard>
        </Link>
      </div>
    </FillBackgroundDesign>
  );
};

export default Auth;
