import { Navigate, Route, Routes, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney } from "@fortawesome/free-solid-svg-icons";

import { useAuthContext } from "@f/authContext";

import Register from "./Register/register";
import Reset from "./Reset/reset";
import Signin from "./Signin/signin";
import MoveCard from "./moveCard";
import VerifyEmail from "./VerifyEmail/verifyEmail";
import Setup from "./Setup/setup";
import "./auth.css";

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
  const context = useAuthContext(false);
  const location = useLocation();
  const titleMap: Record<string, string> = {
    "/auth/login": "ログイン",
    "/auth/register": "新規登録",
    "/auth/reset": "パスワード再設定",
    "/auth/verify": "メールアドレス認証",
    "/auth/setup": "プロフィール作成",
  };
  const title = titleMap[location.pathname] ?? "ログイン";

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
    <main className="container-fluid p-0 auth-shell">
      <div className="row g-0 min-vh-100">
        <section className="col-lg-7 auth-visual-panel" aria-hidden="true" />

        <section className="col-lg-5 auth-form-panel" aria-label="認証">
          <div className="w-100 auth-form-inner">
            <div className="d-flex justify-content-end mb-3">
              <a href="/" className="btn btn-outline-secondary">
                <FontAwesomeIcon icon={faHouseChimney} className="me-2" />
                ホーム
              </a>
            </div>

            <div className="card auth-form-card shadow-sm">
              <div className="card-header bg-white border-bottom-0 px-4 pt-4 pb-0">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src="/logos/nohaikei.svg"
                    alt="My History"
                    className="auth-logo"
                  />
                  <div>
                    <div className="fw-bold">My History</div>
                    <div className="text-muted small">Scouting records</div>
                  </div>
                </div>
                <h1 className="h3 mb-3">{title}</h1>
                <MoveCard />
              </div>

              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Signin />} />
                <Route path="/reset" element={<Reset />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/setup" element={<Setup />} />
                {/* 未定義のパスはログインへリダイレクト */}
                <Route
                  path="*"
                  element={<Navigate to="/auth/login" replace />}
                />
              </Routes>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
