import type{ ScoutType} from "b@/types/api/scout";
import Profile from "./edit/profile";
import Units from "./edit/units";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";
import { Link, useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { useState } from "react";
import GinoshoList from "./edit/ginosho";
import Events from "./edit/events";
import { hc } from "@/authContext";

const ScoutDetailEditor = ({
  scoutData,
  setScoutData,
}: {
  scoutData: ScoutType;
  setScoutData: React.Dispatch<React.SetStateAction<ScoutType>>;
}): React.ReactElement => {
  // TMP置き場
  const [scoutDataPersonal, setScoutDataPersonal] = useState<ScoutType["personal"]>(
    scoutData.personal
  );

  const [scoutDataUnit, setScoutDataUnit] = useState<ScoutType["unit"]>(
    scoutData.unit
  );

  const [scoutDataGinosho, setScoutDataGinosho] = useState<ScoutType["ginosho"]>(
    scoutData.ginosho
  );

  const [scoutDataEvents, setScoutDataEvents] = useState<ScoutType["event"]>(
    scoutData.event
  );

  // 保存時遷移用
  const nav = useNavigate();

  //　保存時にプロファイルの変更をローカルで反映させるための関数
  const handleProfileChange = async () => {
    const updatedData: ScoutType = {
      id: scoutData.id,
      personal: scoutDataPersonal,
      unit: scoutDataUnit,
      ginosho: scoutDataGinosho,
      event: scoutDataEvents,
    };

    const result = await hc?.apiv1.;

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
