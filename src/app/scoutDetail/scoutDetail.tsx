import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./view/viewer";
import { Scout } from "@/types/scout/scout";
import { useState } from "react";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const defaultScout: Scout = useLocation().state?.scout || {};

  if (mode !== "view" && mode !== "edit") {
    // modeがviewかeditでない場合は、viewモードにリダイレクト
    return <Navigate to={`/app/scouts/${id}/view`} replace />;
  }

  const [scoutData, setScoutData] = useState<Scout>(defaultScout);

  if (mode === "view") {
    // ビューモードの処理
    return <ScoutDetailViewer />;
  } else if (mode === "edit") {
    // 編集モードの処理
    return (
      <div>
        <h1>Edit Scout Detail</h1>
        <p>Editing scout with ID: {id}</p>
        <p>{JSON.stringify(scoutData)}</p>
      </div>
    );
  } else {
    return <Navigate to={`/app/scouts/${id}/view`} />;
  }
};

export default ScoutDetail;
