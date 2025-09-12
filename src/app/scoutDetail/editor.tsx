import { Scout, ScoutPersonalData } from "@/types/scout/scout";
import { UnitExperience } from "@/types/scout/scoutUnit";
import Profile from "./edit/profile";
import Units from "./edit/units";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";
import { Link, useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { setScoutRecord } from "@/firebase/scoutDb/scout";
import { Ginosho } from "@/types/scout/ginosho";
import { ScoutEvent } from "@/types/scout/event";
import GinoshoList from "./edit/ginosho";
import Events from "./edit/events";

const ScoutDetailEditor = ({
  scoutData,
  setScoutData,
}: {
  scoutData: Scout;
  setScoutData: React.Dispatch<React.SetStateAction<Scout>>;
}): React.ReactElement => {
  // TMP置き場
  const [scoutDataPersonal, setScoutDataPersonal] = useState<ScoutPersonalData>(
    scoutData.personal
  );

  const [scoutDataUnit, setScoutDataUnit] = useState<UnitExperience[]>(
    scoutData.unit
  );

  const [scoutDataGinosho, setScoutDataGinosho] = useState<Ginosho[]>(
    scoutData.ginosho
  );

  const [scoutDataEvents, setScoutDataEvents] = useState<ScoutEvent[]>(
    scoutData.events
  );

  // 保存時遷移用
  const nav = useNavigate();

  //　保存時にプロファイルの変更をローカルで反映させるための関数
  const handleProfileChange = async (data: Scout) => {
    const updatedData = {
      ...data,
      personal: scoutDataPersonal,
      unit: scoutDataUnit,
      ginosho: scoutDataGinosho,
      events: scoutDataEvents,
    };

    const result = await setScoutRecord(updatedData);

    if (result.status === "success") {
      setScoutData(() => ({
        ...result.data,
      }));
      nav(`/app/scouts/${data.id}/view`);
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
              to={`/app/scouts/${scoutData.id}/view`}
              className="btn btn-outline-secondary me-2"
            >
              キャンセルして戻る
            </Link>
            <Button
              onClick={() => {
                handleProfileChange(scoutData);
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
              ginosho={scoutData.ginosho}
              setGinoshoFunc={(data) => {
                setScoutData((prev) => ({ ...prev, ginosho: data }));
              }}
            />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <Events events={scoutData.events} />
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
