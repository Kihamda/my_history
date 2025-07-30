import { useLocation } from "react-router";

const ScoutDetail = () => {
  // URLを取得→参照するスカウトの情報を決定。無かったら検索フォームへ
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id
  const isEditMode = useLocation().pathname.split("/")[4] === "edit"; // /app/scouts/:id/edit

  if (isEditMode) {
    // 編集モードの処理
    return (
      <div>
        <h1>Edit Scout Detail</h1>
        <p>Editing scout with ID: {id}</p>
      </div>
    );
  } else {
    // 詳細表示モードの処理
    return (
      <div>
        <h1>Scout Detail</h1>
        <p>Viewing details for scout with ID: {id}</p>
      </div>
    );
  }
};

export default ScoutDetail;
