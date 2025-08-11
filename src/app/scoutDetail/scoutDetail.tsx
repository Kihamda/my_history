import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./view/viewer";
import { Scout } from "@/types/scout/scout";
import { useEffect, useState } from "react";
import ScoutDetailEditor from "./edit/editor";
import LoadingSplash from "@/style/loadingSplash";
import getScoutData from "@/firebase/scoutDb/getScoutData";
import { raiseError } from "@/errorHandler";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const defaultScout: Scout = useLocation().state?.scout || {};

  const [scoutData, setScoutData] = useState<Scout>(defaultScout);
  const [isLoading, setIsLoading] = useState<boolean>(
    Object.keys(scoutData).length === 0
  );

  useEffect(() => {
    // scoutDataが空の場合はデータを取得する
    if (Object.keys(scoutData).length === 0) {
      setIsLoading(true);
      // ここでFirebaseやAPIからスカウトデータを取得する処理を追加
      getScoutData(id).then((data) => {
        if (!data) {
          raiseError("スカウトの情報が見つかりませんでした。");
        } else {
          setScoutData(data);
          setIsLoading(false);
        }
      });
    }
  }, [id]);

  if (mode !== "view" && mode !== "edit") {
    // modeがviewかeditでない場合は、viewモードにリダイレクト
    return (
      <Navigate
        to={`/app/scouts/${id}/view`}
        replace
        state={{ scout: defaultScout || null }}
      />
    );
  }

  if (isLoading || Object.keys(scoutData).length === 0) {
    // データがロード中の場合はローディング表示を返す
    return (
      <LoadingSplash
        message="スカウトの情報を読み込み中..."
        fullScreen={false}
      />
    );
  }

  if (mode === "view") {
    // ビューモードの処理
    return <ScoutDetailViewer scoutData={scoutData} />;
  } else if (mode === "edit") {
    // 編集モードの処理
    return (
      <ScoutDetailEditor scoutData={scoutData} setScoutData={setScoutData} />
    );
  } else {
    return <Navigate to={`/app/scouts/${id}/view`} />;
  }
};

export default ScoutDetail;
