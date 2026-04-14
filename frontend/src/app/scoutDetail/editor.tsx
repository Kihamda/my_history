import Profile from "./edit/profile";
import Units from "./edit/units";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { Link, useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { useState } from "react";
import GinoshoList from "./edit/ginosho";
import Events from "./edit/events";
import type { ScoutData, ScoutUpdate } from "@f/lib/api/apiTypes";
import { hc } from "@f/lib/api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import ShareBoxPopupCard from "@f/lib/popupContext/shares";
import { raiseError } from "@f/errorHandler";
import ScoutTransfarPopup from "./edit/scoutTransfar";

const ScoutDetailEditor = ({
  scoutData,
  setScoutData,
  scoutID,
}: {
  scoutData: ScoutData;
  setScoutData: (param: ScoutData) => void;
  scoutID: string;
}): React.ReactElement => {
  // TMP置き場
  const [scoutDataPersonal, setScoutDataPersonal] = useState<
    ScoutData["personal"]
  >(scoutData.personal);

  const [scoutDataUnit, setScoutDataUnit] = useState<ScoutData["unit"]>(
    scoutData.unit,
  );

  const [scoutDataGinosho, setScoutDataGinosho] = useState<
    ScoutData["ginosho"]
  >(scoutData.ginosho);

  const [scoutDataEvents, setScoutDataEvents] = useState<ScoutData["event"]>(
    scoutData.event,
  );

  // 保存時遷移用
  const nav = useNavigate();

  // ポップアップ
  const { showPopup } = usePopup();

  //　保存時にプロファイルの変更をローカルで反映させるための関数
  const handleProfileChange = async () => {
    const updatedData: ScoutUpdate = {
      json: {
        data: {
          personal: scoutDataPersonal,
          unit: scoutDataUnit,
          ginosho: scoutDataGinosho,
          event: scoutDataEvents,
          last_Edited: new Date().toISOString().split("T")[0],
        },
      },
      param: { id: scoutID },
    };

    const result = await hc.apiv1.scout[":id"].$put(updatedData);

    if (result.status === 200) {
      setScoutData({
        belongGroupId: scoutData.belongGroupId,
        personal: scoutDataPersonal,
        unit: scoutDataUnit,
        ginosho: scoutDataGinosho,
        event: scoutDataEvents,
        last_Edited: new Date().toISOString().split("T")[0],
      });
      raiseError("スカウトデータの保存に成功しました。", "success");
      nav(`/app/scouts/${scoutID}/view`);
    }
  };

  const handleDelete = async () => {
    const result = await hc.apiv1.scout[":id"].$delete({
      param: { id: scoutID },
    });
    if (result.status === 200) {
      raiseError("スカウトデータの削除に成功しました。", "success");
      nav(`/app/scouts`);
    } else {
      raiseError(
        "スカウトデータの削除に失敗しました。",
        "error",
        (await result.json()).message,
      );
    }
  };

  return (
    <>
      <FullWidthCardHeader
        title={`${scoutData.personal.name}さんの情報`}
        memo={"保存ボタンを押すと編集を終了します"}
        buttons={
          <>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() =>
                showPopup({
                  content: <ShareBoxPopupCard id={scoutID} isEditable />,
                })
              }
            >
              <FontAwesomeIcon icon={faShareNodes} />
            </Button>
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

      <div className="mt-3">
        <FullWidthCardHeader
          title="スカウトデータの削除"
          buttons={
            <>
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    confirm(
                      "本当に削除しますか？この操作は取り消せません。データの復旧は管理者も不可能ですから、利用者の責任において削除したものとします。",
                    ) &&
                    confirm(
                      "本当に削除しますか？" +
                        scoutData.personal.name +
                        "さんのデータは完全に抹消されます。この操作は取り消せません。",
                    )
                  )
                    handleDelete();
                }}
              >
                スカウトデータを削除する
              </Button>
            </>
          }
          memo="スカウトデータを削除します。削除したデータは復元できません。"
        />
        <div className="mt-3"></div>
        <FullWidthCardHeader
          title="スカウトデータの移管"
          memo="スカウトデータを他のユーザーに移管します。移管したデータは復元できません。"
          buttons={
            <>
              <Button
                variant="warning"
                onClick={() =>
                  showPopup({
                    content: (
                      <ScoutTransfarPopup data={scoutData} id={scoutID} />
                    ),
                  })
                }
              >
                スカウトデータを移管する
              </Button>
            </>
          }
        />
      </div>
    </>
  );
};

export default ScoutDetailEditor;
