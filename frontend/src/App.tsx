import { Route, Routes } from "react-router";

import { ErrorProvider } from "./errorHandler";

/*
 * このアプリケーションのルートファイル
 * Routes以下でランディングページ、認証ページ、アプリ画面を振り分ける
 *
 * 各コンポーネントはパフォーマンス向上のため遅延読み込みする
 */
import { lazy, Suspense, useEffect } from "react";
import LoadingSplash from "@/style/loadingSplash";

const Auth = lazy(() => import("@/auth/auth"));
const AppPage = lazy(() => import("@/app/app"));
const AuthProvider = lazy(() => import("@/authContext"));
const PopupProvider = lazy(() => import("@/style/fullscreanPopup"));

// ここで/〇〇/の変更が生じるときはfirebase.jsonのrewritesも変更すること

// メインアプリケーションコンポーネント
function MainApp() {
  return (
    <ErrorProvider>
      <Suspense fallback={<LoadingSplash />}>
        <PopupProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Reload />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/auth/*" element={<Auth />} />
              <Route path="/app/*" element={<AppPage />} />
            </Routes>
          </AuthProvider>
        </PopupProvider>
      </Suspense>
    </ErrorProvider>
  );
}

const Reload = () => {
  useEffect(() => {
    // ページが読み込まれたときにリロードする
    setTimeout(() => {
      // 1秒後にリロード
      window.location.reload();
    }, 1000);
  }, []);

  return (
    <div className="text-center vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1>こんにちは</h1>
      <p>
        あなたがこの画面を見ているということは、トップ画面を作った人が何かをやらかしたということです。
      </p>
      <p>
        続行するには、以下のボタンを押してページをリロードしてみてください。
        可能であれば、何をしてこの画面に至ったのか開発者に連絡してください。
      </p>
      <p>Hi! If you see this, Developer may have done something wrong.</p>
      <p>
        Please try to reload the page by clicking the button below. If possible,
        please contact the developer about what you did to reach this screen.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
      <div className="mt-3">
        <a href="/auth/login" className="btn btn-secondary ms-2">
          ログイン画面へ
        </a>
      </div>
    </div>
  );
};

const NotFound = () => {
  return (
    <div className="text-center vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1>404 NOT FOUND</h1>
      <p>不正なURLです。</p>
      <p>以下のボタンを押すと、ホームページに戻ります。</p>
      <p>You've reached a page that doesn't exist.</p>
      <p>Press the button below to return to the homepage.</p>
      <a
        href="/"
        className="btn btn-primary"
        style={{ textDecoration: "none" }}
      >
        ホームに戻る
      </a>
    </div>
  );
};

export default MainApp;
