import { useAuthContext } from "@f/authContext";
import { Navigate, Route, Routes } from "react-router";
import Header from "./parts/header";

import { lazy, Suspense } from "react";
import LoadingSplash from "@f/style/loadingSplash";

// 遅延読み込みするコンポーネント
const LeaderHome = lazy(() => import("./home/leaderHome"));
const VisitorHome = lazy(() => import("./home/visitorHome"));
const Scouts = lazy(() => import("./scouts/scouts"));
const ScoutDetail = lazy(() => import("./scoutDetail/scoutDetail"));
const NewScoutWizard = lazy(() => import("./scoutDetail/newScoutWizard"));
const Setting = lazy(() => import("./setting/setting"));

const App = () => {
  // ログアウト状態なのに/appにアクセスした人をログインページに送還する
  const user = useAuthContext()?.user;
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  const userName = user.profile.displayName || "名称未設定";
  const isAdmin = user.currentGroup?.role == "ADMIN" || false; // 管理者かどうかのフラグ。userオブジェクトのisAdminプロパティを使用して判定
  const isLeader = user.currentGroup != undefined || false; // リーダーかどうかのフラグ。
  // const isEditable = user.currentGroup?.isEditable || false; // スカウトを編集可能かどうかのフラグ。userオブジェクトのisEditableプロパティを使用して判定

  return (
    <>
      <Header name={userName} isLeader={isLeader} isAdmin={isAdmin} />
      <div className="container mb-3" style={{ marginTop: "4.5rem" }}>
        <Suspense fallback={<LoadingSplash message="読み込み中" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/app/home" />} />
            <Route
              path="/home"
              element={<>{isLeader ? <LeaderHome /> : <VisitorHome />}</>}
            />
            <Route path="/scouts" element={<Scouts />} />
            <Route path="/scouts/new" element={<NewScoutWizard />} />
            <Route path="/scouts/*" element={<ScoutDetail />} />
            <Route path="/group" element={<>group</>} />
            <Route path="/setting/*" element={<Setting />} />
            <Route path="/setup" element={<>setup</>} />
            <Route path="*" element={<Navigate to="/app/home" />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
