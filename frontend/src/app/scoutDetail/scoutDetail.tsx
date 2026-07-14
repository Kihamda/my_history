import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./viewer";
import ScoutDetailEditor from "./editor";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { useAuthContext } from "@f/authContext";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { apiJson, hc } from "@f/lib/api/api";
import { useQuery } from "@tanstack/react-query";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const { currentGroup, user } = useAuthContext();
  const scoutQuery = useQuery({
    queryKey: ["scout", id],
    queryFn: (): Promise<ScoutData> =>
      apiJson(
        hc.apiv1.scout[":id"].$get({ param: { id } }),
        "スカウトの情報の取得に失敗しました。",
      ),
  });

  // データがロード中の場合はローディング表示を返す
  if (scoutQuery.isPending) {
    return (
      <LoadingSplash
        message="スカウトの情報を読み込み中..."
        fullScreen={false}
      />
    );
  }

  if (scoutQuery.data) {
    const scoutData = scoutQuery.data;
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
