import { useNavigate } from "react-router";

const LeaderHome = () => {
  const nav = useNavigate();

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "90vh" }}
    >
      <div className="d-flex flex-column align-items-center justify-content-center w-100 flex-grow-1">
        <div className="row w-100 justify-content-center">
          <img
            src="/logos/fulllogo.svg"
            alt="My History"
            className="col-12 col-md-8"
          />
          <input
            type="text"
            className="form-control mt-3"
            placeholder="情報を知りたい人の名前をここに入力しましょう"
          />
          <div className="d-flex justify-content-center">
            <button className="btn btn-primary mt-3">検索</button>
            <button
              className="btn btn-outline-secondary mt-3 ms-2"
              onClick={() => nav("/app/scouts")}
            >
              より詳細な検索▶
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center mt-4 justify-self-bottom">
        <h2>リーダーのホーム</h2>
        <p>ここでは、リーダーとしての機能や情報を提供します。</p>
      </div>
    </div>
  );
};

export default LeaderHome;
