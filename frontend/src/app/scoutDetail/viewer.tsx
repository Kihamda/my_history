import Profile from "./view/profile";
import Units from "./view/units";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { Link } from "react-router";
import GinoshoList from "./view/ginosho";
import Events from "./view/events";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { Button } from "react-bootstrap";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import ShareBoxPopupCard from "@f/lib/popupContext/shares";

const ScoutDetailViewer = ({
  scoutData,
  isEditable,
  scoutID,
}: {
  scoutData: ScoutData;
  isEditable: boolean;
  scoutID: string;
}): React.ReactElement => {
  const { showPopup } = usePopup();

  return (
    <>
      <FullWidthCardHeader
        title={`${scoutData.personal.name}さんの情報`}
        memo={
          isEditable ? "編集を開始するにはボタンを押します" : "閲覧のみ可能です"
        }
        buttons={
          <>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() =>
                showPopup({
                  content: <ShareBoxPopupCard id={scoutID} />,
                })
              }
            >
              <FontAwesomeIcon icon={faShareNodes} />
            </Button>
            <Link to={`/app/scouts`} className="btn btn-outline-secondary me-2">
              検索結果に戻る
            </Link>
            {isEditable && (
              <Link
                to={`/app/scouts/${scoutID}/edit`}
                className="btn btn-primary"
              >
                編集する
              </Link>
            )}
          </>
        }
      />
      <Profile scoutDataPersonal={scoutData.personal} />
      <div className="mt-5">
        <FullWidthCardHeader title="活動記録" />
        <div className="row mt-3">
          <div className="col-12 col-md-6 mb-3">
            <GinoshoList ginosho={scoutData.ginosho} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <Events events={scoutData.event} />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <FullWidthCardHeader
          title="各隊での活動記録"
          memo="各隊での入団日時や進級章、スカウト役務の情報を表示します"
        />
        <Units scoutDataUnit={scoutData.unit} />
      </div>
    </>
  );
};

export default ScoutDetailViewer;
