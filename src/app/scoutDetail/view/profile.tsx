import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import { ScoutPersonalData } from "@/types/scout/scout";
import { ScoutUnitNameMap } from "@/types/scout/unit";

const Profile = ({
  scoutDataPersonal,
}: {
  scoutDataPersonal: ScoutPersonalData;
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
              value={ScoutUnitNameMap[scoutDataPersonal.currentUnit]}
            />
            <ShowData label="登録番号" value={scoutDataPersonal.ScoutId} />
            <ShowData
              label="誕生日"
              value={`${convertInputDate(scoutDataPersonal.birthday)} (満${
                new Date(
                  new Date().getTime() -
                    new Date(scoutDataPersonal.birthday).getTime()
                ).getFullYear() - 1970
              }歳)`}
            />
            <ShowData
              label="入団日"
              value={convertInputDate(scoutDataPersonal.joinedDate)}
            />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-0">ちかい</h5>
          </div>
          <div className="card-body">
            {scoutDataPersonal.declare.isDone ? (
              <>
                <ShowData
                  label="ちかいを立てた日"
                  value={convertInputDate(scoutDataPersonal.declare.date)}
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
                scoutDataPersonal.religion.faith.has
                  ? "取得済：" +
                    convertInputDate(scoutDataPersonal.religion.faith.date)
                  : "未取得"
              }
            />
            <ShowData
              label="宗教章"
              value={
                scoutDataPersonal.religion.religion.has
                  ? "取得済(" +
                    scoutDataPersonal.religion.religion.type +
                    ")：" +
                    convertInputDate(scoutDataPersonal.religion.religion.date)
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
