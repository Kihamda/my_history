import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./viewer";
import { useEffect, useState } from "react";
import ScoutDetailEditor from "./editor";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { raiseError } from "@f/errorHandler";
import { useAuthContext } from "@f/authContext";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { hc } from "@f/lib/api/api";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentGroup, user } = useAuthContext();

  const handleFetchScouts = async (scoutId: string) => {
    setIsLoading(true);
    const data = await hc.apiv1.scout[":id"].$get({ param: { id: scoutId } });
    if (data.ok) {
      const jsonData = await data.json();
      setScoutData(jsonData);
    } else {
      raiseError("スカウトの情報の取得に失敗しました。");
      setScoutData(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleFetchScouts(id);
  }, [id]);

  // データがロード中の場合はローディング表示を返す
  if (isLoading) {
    return (
      <LoadingSplash
        message="スカウトの情報を読み込み中..."
        fullScreen={false}
      />
    );
  }

  if (scoutData) {
    const isEditable = currentGroup
      ? currentGroup.role == "ADMIN" || currentGroup.role == "EDIT"
      : user.auth.shares.find((s) => s.id == id)?.role == "EDIT";

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
  } else {
    return <Navigate to="/app/scouts" />;
  }
};

export default ScoutDetail;
