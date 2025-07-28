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

const Landing = lazy(() => import("@/landing/landing"));
const ProtectedRouter = lazy(() => import("@/protectedRouter"));

// メインアプリケーションコンポーネント
function MainApp() {
  return (
    <ErrorProvider>
      <Suspense fallback={<LoadingSplash />}>
        <Routes>
          {/* 公開ページ（認証不要） */}
          <Route path="/" element={<Landing />} />

          {/* 認証が必要なページ（AuthProvider内） */}
          <Route path="/*" element={<ProtectedRouter />} />
        </Routes>
      </Suspense>
    </ErrorProvider>
  );
}

export default MainApp;
