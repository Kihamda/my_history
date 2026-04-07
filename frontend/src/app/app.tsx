import { useAuthContext } from "@f/authContext";
import { Navigate, Route, Routes } from "react-router";
import Header from "./parts/header";

import { lazy, Suspense } from "react";
import LoadingSplash from "@f/lib/style/loadingSplash";

// 遅延読み込みするコンポーネント
const LeaderHome = lazy(() => import("./home/leaderHome"));
const VisitorHome = lazy(() => import("./home/visitorHome"));
const Scouts = lazy(() => import("./scouts/scouts"));
const ScoutDetail = lazy(() => import("./scoutDetail/scoutDetail"));
const NewScoutWizard = lazy(() => import("./scoutDetail/newScoutWizard"));
const Setting = lazy(() => import("./setting/setting"));
const GroupPage = lazy(() => import("./group/group"));

const App = () => {
  // ログアウト状態なのに/appにアクセスした人をログインページに送還する
  // これ以降はuseAuthContext()は(引数がfalseでなくても)必ず値を返すから安心して使ってよい
  const { user, currentGroup, token } = useAuthContext(false) || {};
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  if (!user) {
    return <Navigate to="/auth/setup" replace />;
  }

  return (
    <>
      <Header />
      <div className="container mb-3" style={{ marginTop: "4.5rem" }}>
        <Suspense fallback={<LoadingSplash message="読み込み中" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/app/home" />} />
            <Route
              path="/home"
              element={<>{currentGroup ? <LeaderHome /> : <VisitorHome />}</>}
            />
            <Route path="/scouts" element={<Scouts />} />
            <Route path="/scouts/new" element={<NewScoutWizard />} />
            <Route path="/scouts/*" element={<ScoutDetail />} />
            <Route path="/group/*" element={<GroupPage />} />
            <Route path="/setting/*" element={<Setting />} />
            <Route path="*" element={<Navigate to="/app/home" />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
