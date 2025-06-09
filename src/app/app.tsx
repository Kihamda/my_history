import { useAuthContext } from "@/firebase/authContext";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./parts/header";

const App = () => {
  // ログアウト状態なのに/appにアクセスした人をログインページに送還する
  const { user } = useAuthContext();
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: "3.5rem" }}>
        <Routes>
          <Route path="/" element={<>home</>} />
          <Route path="/scouts" element={<>scouts</>} />
          <Route path="/group" element={<>group</>} />
          <Route path="/setting" element={<>setting</>} />
        </Routes>
      </div>
    </>
  );
};

export default App;
