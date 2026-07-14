import Profile from "./edit/profile";
import Units from "./edit/units";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useNavigate } from "react-router";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import GinoshoList from "./edit/ginosho";
import Events from "./edit/events";
import type { ScoutData, ScoutUpdate } from "@f/lib/api/apiTypes";
import { apiJson, hc, queryClient } from "@f/lib/api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import ShareBoxPopupCard from "@f/lib/popupContext/shares";
import { raiseError } from "@f/errorHandler";
import ScoutTransfarPopup from "./edit/scoutTransfar";
import { useMutation } from "@tanstack/react-query";

const ScoutDetailEditor = ({
  scoutData,
  scoutID,
}: {
  scoutData: ScoutData;
  scoutID: string;
}): React.ReactElement => {
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

  const nav = useNavigate();
  const { showPopup } = usePopup();

  const updatedScoutData: ScoutData = {
    belongGroupId: scoutData.belongGroupId,
    personal: scoutDataPersonal,
    unit: scoutDataUnit,
    ginosho: scoutDataGinosho,
    event: scoutDataEvents,
    last_Edited: new Date().toISOString().split("T")[0],
  };
  const isDirty =
    JSON.stringify([scoutDataPersonal, scoutDataUnit, scoutDataGinosho, scoutDataEvents]) !==
    JSON.stringify([scoutData.personal, scoutData.unit, scoutData.ginosho, scoutData.event]);

  useEffect(() => {
    if (!isDirty) return;

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const preventLinkNavigation = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      if (!confirm("未保存の変更があります。変更を破棄して移動しますか？")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", preventLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", preventLinkNavigation, true);
    };
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiJson(
        hc.apiv1.scout[":id"].$put({
        json: {
          data: updatedScoutData,
        },
        param: { id: scoutID },
        } satisfies ScoutUpdate),
        "スカウトデータの保存に失敗しました。",
      ),
    onSuccess: () => {
      queryClient.setQueryData(["scout", scoutID], updatedScoutData);
      raiseError("スカウトデータの保存に成功しました。", "success");
      nav(`/app/scouts/${scoutID}/view`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiJson(
        hc.apiv1.scout[":id"].$delete({ param: { id: scoutID } }),
        "スカウトデータの削除に失敗しました。",
      ),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["scout", scoutID] });
      raiseError("スカウトデータの削除に成功しました。", "success");
      nav("/app/scouts");
    },
  });

  const handleCancel = () => {
    if (
      !isDirty ||
      confirm("未保存の変更があります。変更を破棄して戻りますか？")
    ) {
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
            <Button
              variant="outline-secondary"
              className="btn btn-outline-secondary me-2"
              onClick={handleCancel}
            >
              キャンセルして戻る
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "保存中" : "保存して戻る"}
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
                    deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
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
      <div className="sticky-bottom bg-body border rounded p-2 mt-3 text-end">
        <Button
          variant="outline-secondary"
          className="me-2"
          onClick={handleCancel}
        >
          キャンセル
        </Button>
        <Button
          disabled={!isDirty || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? "保存中" : "変更を保存"}
        </Button>
      </div>
    </>
  );
};

export default ScoutDetailEditor;
