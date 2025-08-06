import { Scout } from "@/types/scout/scout";
import { ScoutUnitNameMap } from "@/types/scout/scoutUnit";
import { Link } from "react-router";

const ScoutDetailHeader = ({
  scoutData,
}: {
  scoutData: Scout;
}): React.ReactElement => {
  return (
    <div className="card">
      <div className="card-body row">
        <div className="col-12 col-md-9">
          <h3 className="card-title">{scoutData.personal.name}さんの情報</h3>
          <p className="card-text">
            {ScoutUnitNameMap[scoutData.personal.currentUnit]}所属
          </p>
        </div>
        <div className="col-12 col-md-3">
          <Link to={`/app/scouts`} className="btn btn-outline-secondary me-2">
            検索結果に戻る
          </Link>
          <Link
            to={`/app/scouts/${scoutData.id}/edit`}
            className="btn btn-primary"
          >
            編集する
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScoutDetailHeader;
