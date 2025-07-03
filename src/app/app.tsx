import { useAuthContext } from "@/firebase/authContext";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./parts/header";
import LeaderHome from "./home/leaderHome";
import VisitorHome from "./home/visitorHome";

const App = () => {
  // ログアウト状態なのに/appにアクセスした人をログインページに送還する
  const { user, userData } = useAuthContext();
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  //基本的にここでログインユーザーの情報をconstにして子コンポーネントに渡していく。
  const uid = user.uid;
  const userName = userData?.displayName || "名称未設定";
  const emailVerified = user.emailVerified; // メールアドレスの確認状態
  const isLeader = userData?.joinGroupId ? true : false; // リーダーかどうかのフラグ。joinGroupIdが存在する場合はリーダーとみなす
  //  const isAdmin = userData?.isLeader || false; // 管理者かどうかのフラグ。isLeaderがtrueの場合は管理者とみなす。※未使用なのでコメントアウト

  if (emailVerified === false) {
    // メールアドレスが未確認の場合、設定ページにリダイレクト
    return <Navigate to="/auth/verify" />;
  }

  return (
    <>
      <Header name={userName} isLeader={isLeader} />
      <div className="container" style={{ marginTop: "3.5rem" }}>
        <Routes>
          <Route
            path="/"
            element={<>{isLeader ? <LeaderHome /> : <VisitorHome />}</>}
          />
          <Route path="/scouts/*" element={<>{uid + "\n" + user}</>} />
          <Route path="/group" element={<>group</>} />
          <Route path="/setting" element={<>setting</>} />
        </Routes>
      </div>
    </>
  );
};

export default App;
