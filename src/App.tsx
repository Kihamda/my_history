import { Route, Routes } from "react-router-dom";
import Landing from "@/landing/landing";
import Auth from "@/auth/auth";
import App from "@/app/app";
import { AuthProvider } from "@/firebase/authContext";
import SysManager from "@/sysManager/sysManager";
import { ErrorProvider } from "./errorHandler";

/*
 * このアプリケーションのルートファイル
 * Routes以下でランディングページ、認証ページ、アプリ画面を振り分ける
 */

function MainApp() {
  return (
    <ErrorProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <Routes>
                <Route path="/auth/*" element={<Auth />} />
                <Route path="/app/*" element={<App />} />
                <Route path="/sysmanager/*" element={<SysManager />} />
              </Routes>
            </AuthProvider>
          }
        />
      </Routes>
    </ErrorProvider>
  );
}

export default MainApp;
