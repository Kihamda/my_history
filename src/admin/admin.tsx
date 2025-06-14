import { useAuthContext } from "@/firebase/authContext";
import { FC } from "react";
import { Container } from "react-bootstrap";
import { Navigate } from "react-router-dom";

const Admin: FC = () => {
  //ユーザIDが私であるかどうかを判別してそうでなかったらappに転送

  const auth = useAuthContext();

  const userId = auth.user?.email;
  if (userId !== "work@kihamda.net") {
    return <Navigate to="/app" />;
  }

  return (
    <Container className="mt-2">
      <div className="mt-5 card text-center">
        <h1>Admin Page</h1>
        <p>This is the admin page. Only accessible to administrators.</p>
        <p>ユーザーの管理はfirebaseのコンソールから行います。</p>
      </div>
      <div className="mt-5 card">
        <div className="card-body">
          <h2 className="card-title">団体の管理</h2>
          <p className="card-text">
            支払い状況に応じて団体操作の可否を管理します。
          </p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary">団体の追加</button>
        </div>
      </div>
      <div className="mt-5 card">
        <div className="card-body">
          <h2 className="card-title">全スカウトの管理</h2>
          <p className="card-text">
            いくつかの情報に基づいてスカウトのraw情報を表示し、削除します。
          </p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary">ユーザーの追加</button>
        </div>
      </div>
      <div className="mt-5 card">
        <div className="card-body">
          <h2 className="card-title">技能章・細目・進級章マスタの管理</h2>
          <p className="card-text">
            支払い状況に応じて支払い操作の可否を管理します。
          </p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary">支払いの追加</button>
        </div>
      </div>
    </Container>
  );
};

export default Admin;
