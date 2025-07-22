import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/firebase/authContext";
import SysManager from "@/sysManager/sysManager";
import { ErrorProvider } from "./errorHandler";

/*
 * このアプリケーションのルートファイル
 * Routes以下でランディングページ、認証ページ、アプリ画面を振り分ける
 *
 * 各コンポーネントはパフォーマンス向上のため遅延読み込みする
 */
import { lazy, Suspense } from "react";

const Landing = lazy(() => import("@/landing/landing"));
const Auth = lazy(() => import("@/auth/auth"));
const App = lazy(() => import("@/app/app"));

// メインアプリケーションコンポーネント
function MainApp() {
  return (
    <ErrorProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <Suspense fallback={<div>Loading...</div>}>
                {/* 認証ページとアプリケーションのルーティング */}
                <Routes>
                  <Route path="/auth/*" element={<Auth />} />
                  <Route path="/app/*" element={<App />} />
                  <Route path="/sysmanager/*" element={<SysManager />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          }
        />
      </Routes>
    </ErrorProvider>
  );
}

export default MainApp;
