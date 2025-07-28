import { useAuthContext } from "@/firebase/authContext";
import { Navigate, Route, Routes } from "react-router";
import Header from "./parts/header";

import { lazy, Suspense } from "react";
import LoadingSplash from "@/style/loadingSplash";
import ScoutDetail from "./scoutDetail/scoutDetail";

// 遅延読み込みするコンポーネント
const LeaderHome = lazy(() => import("./home/leaderHome"));
const VisitorHome = lazy(() => import("./home/visitorHome"));
const Scouts = lazy(() => import("./scouts/scouts"));

const App = () => {
  // ログアウト状態なのに/appにアクセスした人をログインページに送還する
  const user = useAuthContext();
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  //基本的にここでログインユーザーの情報をconstにして子コンポーネントに渡していく。
  // const uid = user.uid;
  const userName = user.displayName || "名称未設定";
  const emailVerified = user.emailVerified; // メールアドレスの確認状態
  const isLeader = user.currentGroup?.isLeader || false; // リーダーかどうかのフラグ。
  const isAdmin = user.currentGroup?.isAdmin || false; // 管理者かどうかのフラグ。userオブジェクトのisAdminプロパティを使用して判定
  // const isEditable = user.currentGroup?.isEditable || false; // スカウトを編集可能かどうかのフラグ。userオブジェクトのisEditableプロパティを使用して判定

  if (emailVerified === false) {
    // メールアドレスが未確認の場合、設定ページにリダイレクト
    return <Navigate to="/auth/verify" />;
  }

  return (
    <>
      <Header name={userName} isLeader={isLeader} isAdmin={isAdmin} />
      <div className="container" style={{ marginTop: "4.5rem" }}>
        <Suspense fallback={<LoadingSplash message="読み込み中" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/app/home" />} />
            <Route
              path="/home"
              element={<>{isLeader ? <LeaderHome /> : <VisitorHome />}</>}
            />
            <Route path="/scouts" element={<Scouts />} />
            <Route path="/scouts/*" element={<ScoutDetail />} />
            <Route path="/group" element={<>group</>} />
            <Route path="/setting" element={<>setting</>} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
};

export default App;
