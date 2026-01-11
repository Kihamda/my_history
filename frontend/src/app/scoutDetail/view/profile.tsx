import type { ScoutData } from "@f/lib/api/apiTypes";
import { ScoutUnitNameMap } from "@f/lib/clientCommons/scout";
import ShowData from "@f/style/showData";

const Profile = ({
  scoutDataPersonal,
}: {
  scoutDataPersonal: ScoutData["personal"];
}): React.ReactElement => {
  return (
    <div className="row">
      <div className="col-12 col-md-6">
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">基本情報</h5>
          </div>
          <div className="card-body">
            <ShowData label="名前" value={scoutDataPersonal.name} />
            <ShowData
              label="所属"
              value={ScoutUnitNameMap[scoutDataPersonal.currentUnitId]}
            />
            <ShowData label="登録番号" value={scoutDataPersonal.scoutId} />
            <ShowData
              label="誕生日"
              value={`${scoutDataPersonal.birthDate} (満${
                new Date(
                  new Date().getTime() -
                    new Date(scoutDataPersonal.birthDate).getTime()
                ).getFullYear() - 1970
              }歳)`}
            />
            <ShowData label="入団日" value={scoutDataPersonal.joinedDate} />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">ちかい</h5>
          </div>
          <div className="card-body">
            {scoutDataPersonal.declare.done ? (
              <>
                <ShowData
                  label="ちかいを立てた日"
                  value={scoutDataPersonal.declare.date}
                />
                <ShowData
                  label="ちかいを立てた場所"
                  value={scoutDataPersonal.declare.place}
                />
              </>
            ) : (
              <p>ちかいをまだ立てていません。</p>
            )}
          </div>
        </div>
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">信仰奨励章・宗教章</h5>
          </div>
          <div className="card-body">
            <ShowData
              label="信仰奨励章"
              value={
                scoutDataPersonal.faith.done
                  ? "取得済：" + scoutDataPersonal.faith.date
                  : "未取得"
              }
            />
            <ShowData
              label="宗教章"
              value={
                scoutDataPersonal.religion.done
                  ? "取得済(" +
                    scoutDataPersonal.religion.type +
                    ")：" +
                    scoutDataPersonal.religion.date
                  : "未取得"
              }
            />
          </div>
        </div>
      </div>
      {scoutDataPersonal.memo && (
        <div className="col-12 mt-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">メモ</h5>
            </div>
            <div className="card-body" style={{ whiteSpace: "pre-line" }}>
              {scoutDataPersonal.memo}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;
