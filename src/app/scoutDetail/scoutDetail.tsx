import { Navigate, useLocation } from "react-router";
import ScoutDetailViewer from "./viewer";
import { Scout } from "@/types/scout/scout";
import { useEffect, useState } from "react";
import ScoutDetailEditor from "./editor";
import LoadingSplash from "@/style/loadingSplash";
import { getScoutData } from "@/firebase/scoutDb/scout";
import { raiseError } from "@/errorHandler";
import { useAuthContext } from "@/firebase/authContext";
import { getGinosho } from "@/firebase/scoutDb/ginosho";
import { Ginosho } from "@/types/scout/ginosho";
import { getEvents } from "@/firebase/scoutDb/event";
import { ScoutEvent } from "@/types/scout/event";

const ScoutDetail = (): React.ReactElement => {
  // URLを取得→参照するスカウトの情報を決定。
  const id = useLocation().pathname.split("/")[3]; // /app/scouts/:id newになることはない。
  const mode = useLocation().pathname.split("/")[4];

  const [scoutData, setScoutData] = useState<Scout>(null as unknown as Scout);
  const [ginosho, setGinosho] = useState<Ginosho[]>([]);
  const [events, setEvents] = useState<ScoutEvent[]>([]);

  const isEditable = useAuthContext()?.currentGroup?.isEditable || false;

  useEffect(() => {
    // 無条件にGinoshoとEventsは取得しておく必要がある。
    // 追伸:たぶんね
    getGinosho(id).then((data) => {
      if (!data) {
        raiseError("技能章の情報が見つかりませんでした。");
      } else {
        setGinosho(data);
      }
    });
    getEvents(id).then((data) => {
      if (!data) {
        raiseError("イベントの情報が見つかりませんでした。");
      } else {
        setEvents(data);
      }
    });
    getScoutData(id).then((data) => {
      if (!data) {
        raiseError("スカウトの情報が見つかりませんでした。");
      } else {
        setScoutData(data);
      }
    });
  }, [id]);

  // モードのチェック
  if (mode !== "view" && mode !== "edit") {
    // modeがviewかeditでない場合は、viewモードにリダイレクト
    return <Navigate to={`/app/scouts/${id}/view`} replace />;
  }

  // データがロード中の場合はローディング表示を返す
  if (!(scoutData && ginosho && events)) {
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
