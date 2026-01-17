import { useAuthContext } from "@f/authContext";

const MainPage = () => {
  const currentUserData = useAuthContext().user;
  if (!currentUserData) {
    return <div>ユーザーデータの取得に失敗しました。</div>;
  }

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">基本設定</h2>
          <p>ここでプロフィール設定やプライバシー設定を変更できます。</p>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <h3 className="card-title">プロフィール設定</h3>
          <p>プロフィール情報を編集します。</p>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <h3 className="card-title">プライバシー設定</h3>
          <p>プライバシーオプションを管理します。</p>
        </div>
      </div>
    </>
  );
};

export default MainPage;
