import { useState } from "react";
import { useNavigate } from "react-router";

const LeaderHome = () => {
  const nav = useNavigate();

  const [searchBox, setSearchBox] = useState<string>("");

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "calc(100dvh - 6rem)" }}
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
            value={searchBox}
            onChange={(e) => setSearchBox(e.target.value)}
          />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary mt-3"
              onClick={() =>
                nav("/app/scouts", { state: { searchName: searchBox } })
              }
            >
              検索
            </button>
            <button
              className="btn btn-outline-secondary mt-3 ms-2"
              onClick={() => nav("/app/scouts")}
            >
              より詳細な検索をする
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center justify-self-bottom ">
        <button
          className="btn btn-outline-secondary"
          onClick={() => nav("/app/scouts/new")}
        >
          新しいスカウトの情報を記録する
        </button>
      </div>
    </div>
  );
};

export default LeaderHome;
