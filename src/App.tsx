import { Route, Routes } from "react-router";

import { ErrorProvider } from "./errorHandler";

/*
 * このアプリケーションのルートファイル
 * Routes以下でランディングページ、認証ページ、アプリ画面を振り分ける
 *
 * 各コンポーネントはパフォーマンス向上のため遅延読み込みする
 */
import { lazy, Suspense } from "react";
import LoadingSplash from "@/style/loadingSplash";
import { AuthProvider } from "@/firebase/authContext";

const SysManager = lazy(() => import("@/sysManager/sysManager"));
const Auth = lazy(() => import("@/auth/auth"));
const App = lazy(() => import("@/app/app"));

// メインアプリケーションコンポーネント
function MainApp() {
  return (
    <ErrorProvider>
      <Suspense fallback={<LoadingSplash />}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/app/*" element={<App />} />
            <Route path="/sysmanager/*" element={<SysManager />} />
          </Routes>
        </AuthProvider>
      </Suspense>
    </ErrorProvider>
  );
}

export default MainApp;
