import Profile from "./edit/profile";
import Units from "./edit/units";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";
import { Link, useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { useState } from "react";
import GinoshoList from "./edit/ginosho";
import Events from "./edit/events";
import type { ScoutData } from "@/lib/api/apiTypes";
import { hc } from "@/lib/api/api";

const ScoutDetailEditor = ({
  scoutData,
  setScoutData,
  scoutID,
}: {
  scoutData: ScoutData;
  setScoutData: React.Dispatch<React.SetStateAction<ScoutData>>;
  scoutID: string;
}): React.ReactElement => {
  // TMP置き場
  const [scoutDataPersonal, setScoutDataPersonal] = useState<
    ScoutData["personal"]
  >(scoutData.personal);

  const [scoutDataUnit, setScoutDataUnit] = useState<ScoutData["unit"]>(
    scoutData.unit
  );

  const [scoutDataGinosho, setScoutDataGinosho] = useState<
    ScoutData["ginosho"]
  >(scoutData.ginosho);

  const [scoutDataEvents, setScoutDataEvents] = useState<ScoutData["event"]>(
    scoutData.event
  );

  // 保存時遷移用
  const nav = useNavigate();

  //　保存時にプロファイルの変更をローカルで反映させるための関数
  const handleProfileChange = async () => {
    const updatedData: ScoutData = {
      authedIds: scoutData.authedIds,
      personal: scoutDataPersonal,
      unit: scoutDataUnit,
      ginosho: scoutDataGinosho,
      event: scoutDataEvents,
    };

    const result = await hc.apiv1.scout[":id"].$put({
      param: { id: scoutID },
      json: { data: updatedData },
    });

    if (result.status === 200) {
      setScoutData(() => updatedData);
      nav(`/app/scouts/${scoutID}/view`);
    }
  };

  return (
    <>
      <FullWidthCardHeader
        title={`${scoutData.personal.name}さんの情報`}
        memo={"保存ボタンを押すと編集を終了します"}
        buttons={
          <>
            <Link
              to={`/app/scouts/${scoutID}/view`}
              className="btn btn-outline-secondary me-2"
            >
              キャンセルして戻る
            </Link>
            <Button
              onClick={() => {
                handleProfileChange();
              }}
            >
              保存して戻る
            </Button>
          </>
        }
      />
      <Profile
        scoutData={scoutDataPersonal}
        setScoutData={setScoutDataPersonal}
      />
      <div className="mt-5">
        <FullWidthCardHeader title="活動記録" />
        <div className="row mt-3">
          <div className="col-12 col-md-6 mb-3">
            <GinoshoList
              ginosho={scoutDataGinosho}
              setGinoshoFunc={(data) => {
                setScoutDataGinosho(data);
              }}
            />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <Events
              events={scoutDataEvents}
              setEventFunc={(data) => setScoutDataEvents(data)}
            />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <FullWidthCardHeader
          title="各隊での活動記録"
          memo="各隊での入団日時や進級章、スカウト役務の情報を表示します"
        />
        <Units
          scoutDataUnit={scoutDataUnit}
          setScoutDataUnit={setScoutDataUnit}
        />
      </div>
    </>
  );
};

export default ScoutDetailEditor;
