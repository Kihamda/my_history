import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./view/viewer";
import { Scout } from "@/types/scout/scout";
import { useEffect, useState } from "react";
import ScoutDetailEditor from "./edit/editor";
import LoadingSplash from "@/types/style/loadingSplash";
import getScoutData from "@/firebase/scoutDb/getScoutData";
import { raiseError } from "@/errorHandler";
import { useAuthContext } from "@/firebase/authContext";
import {
  clearSpecificScoutCache,
  getScoutsCache,
  setSpecificScoutCache,
} from "@/tools/localCache/scoutsCache";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const defaultScoutData: Scout | undefined = getScoutsCache()?.find(
    (scout) => scout.id === id
  );

  const [scoutData, setScoutData] = useState<Scout | undefined>(
    defaultScoutData
  );

  const isEditable = useAuthContext()?.currentGroup?.isEditable || false;

  useEffect(() => {
    // scoutDataが空の場合はデータを取得する
    if (!scoutData) {
      // ここでFirebaseやAPIからスカウトデータを取得する処理を追加
      getScoutData(id).then((data) => {
        if (!data) {
          raiseError("スカウトの情報が見つかりませんでした。");
        } else {
          setScoutData(data);
          setSpecificScoutCache(data);
        }
      });
    }
  }, [id]);

  // ページを離れるときにキャッシュを削除しておく
  const handleBeforeUnload = () => {
    clearSpecificScoutCache(scoutData?.id || "");
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // モードのチェック
  if (mode !== "view" && mode !== "edit") {
    // modeがviewかeditでない場合は、viewモードにリダイレクト
    return (
      <Navigate
        to={`/app/scouts/${id}/view`}
        replace
        state={{ scout: scoutData || null }}
      />
    );
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
    return <ScoutDetailViewer isEditable={isEditable} scoutData={scoutData} />;
  } else if (mode === "edit") {
    // 編集モードの処理
    if (!isEditable) {
      return <Navigate to={`/app/scouts/${id}/view`} />;
    }
    return (
      <ScoutDetailEditor scoutData={scoutData} setScoutData={setScoutData} />
    );
  } else {
    return <Navigate to={`/app/scouts/${id}/view`} />;
  }
};

export default ScoutDetail;
