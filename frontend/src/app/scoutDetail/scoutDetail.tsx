import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./viewer";
import { useEffect, useState } from "react";
import ScoutDetailEditor from "./editor";
import LoadingSplash from "@f/style/loadingSplash";
import { raiseError } from "@f/errorHandler";
import { useAuthContext } from "@f/authContext";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { hc } from "@f/lib/api/api";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const [scoutData, setScoutData] = useState<ScoutData>(
    null as unknown as ScoutData
  );

  const isEditable =
    useAuthContext()?.user?.joinedGroup?.role == "ADMIN" ||
    useAuthContext()?.user?.joinedGroup?.role == "EDIT";

  useEffect(() => {
    hc.apiv1.scout[":id"].$get({ param: { id } }).then(async (data) => {
      try {
        const jsonData = await data.json();
        if (!jsonData) {
          raiseError("スカウトの情報が見つかりませんでした。");
        } else {
          setScoutData(jsonData);
        }
      } catch (error) {
        raiseError("スカウトの情報の取得に失敗しました。");
      }
    });
  }, [id]);

  // モードのチェック
  if (mode !== "view" && mode !== "edit") {
    // modeがviewかeditでない場合は、viewモードにリダイレクト
    return <Navigate to={`/app/scouts/${id}/view`} replace />;
  }

  // データがロード中の場合はローディング表示を返す
  if (!scoutData) {
    return (
      <LoadingSplash
        message="スカウトの情報を読み込み中..."
        fullScreen={false}
      />
    );
  }

  if (mode === "view") {
    // ビューモードの処理
    return (
      <ScoutDetailViewer
        scoutID={id}
        isEditable={isEditable}
        scoutData={scoutData}
      />
    );
  } else if (mode === "edit") {
    // 編集モードの処理
    if (!isEditable) {
      return <Navigate to={`/app/scouts/${id}/view`} />;
    }
    return (
      <ScoutDetailEditor
        scoutID={id}
        scoutData={scoutData}
        setScoutData={setScoutData}
      />
    );
  } else {
    return <Navigate to={`/app/scouts/${id}/view`} />;
  }
};

export default ScoutDetail;
