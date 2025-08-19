import { Scout } from "@/types/scout/scout";
import Profile from "./profile";
import Units from "./units";
import FullWidthCardHeader from "@/types/style/fullWidthCardHeader";
import { Link } from "react-router";
import Ginosho from "./ginosho";

const ScoutDetailViewer = ({
  scoutData,
  isEditable,
}: {
  scoutData: Scout;
  isEditable: boolean;
}): React.ReactElement => {
  return (
    <>
      <FullWidthCardHeader
        title={`${scoutData.personal.name}さんの情報`}
        memo={
          isEditable ? "編集を開始するにはボタンを押します" : "閲覧のみ可能です"
        }
        buttons={
          <>
            <Link to={`/app/scouts`} className="btn btn-outline-secondary me-2">
              検索結果に戻る
            </Link>
            {isEditable && (
              <Link
                to={`/app/scouts/${scoutData.id}/edit`}
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
          <div className="col-12 col-md-6">
            <Ginosho />
          </div>
          <div className="col-12 col-md-6"></div>
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
