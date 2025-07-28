import { AuthProvider } from "@/firebase/authContext";
import { Route, Routes } from "react-router";
import { lazy, Suspense } from "react";
import LoadingSplash from "@/style/loadingSplash";

const SysManager = lazy(() => import("@/sysManager/sysManager"));
const Auth = lazy(() => import("@/auth/auth"));
const App = lazy(() => import("@/app/app"));

const ProtectedRouter = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSplash />}>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/app/*" element={<App />} />
          <Route path="/sysmanager/*" element={<SysManager />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

export default ProtectedRouter;
