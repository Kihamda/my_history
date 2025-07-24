import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/firebase/authContext";
import { ErrorProvider } from "./errorHandler";

/*
 * このアプリケーションのルートファイル
 * Routes以下でランディングページ、認証ページ、アプリ画面を振り分ける
 *
 * 各コンポーネントはパフォーマンス向上のため遅延読み込みする
 */
import { lazy, Suspense } from "react";
import LoadingSplash from "@/style/loadingSplash";

const SysManager = lazy(() => import("@/sysManager/sysManager"));
const Landing = lazy(() => import("@/landing/landing"));
const Auth = lazy(() => import("@/auth/auth"));
const App = lazy(() => import("@/app/app"));

// メインアプリケーションコンポーネント
function MainApp() {
  return (
    <ErrorProvider>
      <Suspense fallback={<LoadingSplash />}>
        <Routes>
          {/* 公開ページ（認証不要） */}
          <Route path="/" element={<Landing />} />

          {/* 認証が必要なページ（AuthProvider内） */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <Suspense fallback={<LoadingSplash />}>
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
      </Suspense>
    </ErrorProvider>
  );
}

export default MainApp;
