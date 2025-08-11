import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import { UnitExperience, Work } from "@/types/scout/scoutUnit";

const Units = ({
  scoutDataUnit,
}: {
  scoutDataUnit: UnitExperience;
}): React.ReactElement => {
  return (
    <div className="row">
      {scoutDataUnit.bvs.experienced && (
        <UnitCard
          title="ビーバー隊"
          joinedDate={convertInputDate(scoutDataUnit.bvs.joinedDate)}
          gradesNode={
            <>
              <ShowData
                label="ビーバー修了"
                value={
                  scoutDataUnit.bvs.grade.beaver.has
                    ? convertInputDate(scoutDataUnit.bvs.grade.beaver.date)
                    : "未修了"
                }
              />
              <ShowData
                label="ビッグビーバー修了"
                value={
                  scoutDataUnit.bvs.grade.bigbeaver.has
                    ? convertInputDate(scoutDataUnit.bvs.grade.bigbeaver.date)
                    : "未修了"
                }
              />
            </>
          }
          works={scoutDataUnit.bvs.works}
        />
      )}
      {scoutDataUnit.cs.experienced && (
        <UnitCard
          title="カブ隊"
          joinedDate={convertInputDate(scoutDataUnit.cs.joinedDate)}
          gradesNode={
            <>
              <ShowData
                label="うさぎ修了"
                value={
                  scoutDataUnit.cs.grade.rabbit.has
                    ? convertInputDate(scoutDataUnit.cs.grade.rabbit.date)
                    : "未修了"
                }
              />
              <ShowData
                label="しか修了"
                value={
                  scoutDataUnit.cs.grade.deer.has
                    ? convertInputDate(scoutDataUnit.cs.grade.deer.date)
                    : "未修了"
                }
              />
              <ShowData
                label="くま修了"
                value={
                  scoutDataUnit.cs.grade.bear.has
                    ? convertInputDate(scoutDataUnit.cs.grade.bear.date)
                    : "未修了"
                }
              />
            </>
          }
          works={scoutDataUnit.cs.works}
        />
      )}
      {scoutDataUnit.bs.experienced && (
        <UnitCard
          title="ボーイ隊"
          joinedDate={convertInputDate(scoutDataUnit.bs.joinedDate)}
          gradesNode={
            <>
              <ShowData
                label="初級スカウト章修了"
                value={
                  scoutDataUnit.bs.grade.beginner.has
                    ? convertInputDate(scoutDataUnit.bs.grade.beginner.date)
                    : "未修了"
                }
              />
              <ShowData
                label="2級スカウト章修了"
                value={
                  scoutDataUnit.bs.grade.second.has
                    ? convertInputDate(scoutDataUnit.bs.grade.second.date)
                    : "未修了"
                }
              />
              <ShowData
                label="1級スカウト章修了"
                value={
                  scoutDataUnit.bs.grade.first.has
                    ? convertInputDate(scoutDataUnit.bs.grade.first.date)
                    : "未修了"
                }
              />
              <ShowData
                label="菊スカウト章修了"
                value={
                  scoutDataUnit.bs.grade.mum.has
                    ? convertInputDate(scoutDataUnit.bs.grade.mum.date)
                    : "未修了"
                }
              />
            </>
          }
          works={scoutDataUnit.bs.works}
        />
      )}
      {scoutDataUnit.vs.experienced && (
        <UnitCard
          title="ベンチャー隊"
          joinedDate={convertInputDate(scoutDataUnit.vs.joinedDate)}
          gradesNode={
            <>
              <ShowData
                label="入団日時"
                value={convertInputDate(scoutDataUnit.vs.joinedDate)}
              />
              <h4>進級章</h4>
              <ShowData
                label="ベンチャースカウト章修了"
                value={
                  scoutDataUnit.vs.grade.venture.has
                    ? convertInputDate(scoutDataUnit.vs.grade.venture.date)
                    : "未修了"
                }
              />
              <h4>進級章</h4>
              <ShowData
                label="ベンチャースカウト章修了"
                value={
                  scoutDataUnit.vs.grade.venture.has
                    ? convertInputDate(scoutDataUnit.vs.grade.venture.date)
                    : "未修了"
                }
              />
            </>
          }
          works={scoutDataUnit.vs.works}
        />
      )}
      {scoutDataUnit.rs.experienced && (
        <div className="mt-3 col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h3>ローバー隊</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UnitCard: React.FC<{
  title: string;
  joinedDate: string;
  gradesNode: React.ReactNode;
  works: Work[];
}> = ({ title, joinedDate, gradesNode, works }) => {
  return (
    <div className="mt-3 col-12 col-md-6">
      <div className="card">
        <div className="card-body">
          <h3 className="mb-2">{title}</h3>
          <div className="d-flex flex-column flex-md-row">
            <div className="flex-grow-1 mb-3">
              <h5>基本情報</h5>
              <ShowData label="入団日時" value={convertInputDate(joinedDate)} />
            </div>
            <div className="flex-grow-1 mb-3">
              <h5>進級章</h5>
              {gradesNode}
            </div>
          </div>
          <div>
            <h5>スカウト役務 </h5>
            {works.map((work, index) => (
              <ShowData
                key={index}
                label={work.type}
                value={
                  convertInputDate(work.begin) +
                  " ~ " +
                  convertInputDate(work.end)
                }
                memo={work.memo}
              />
            ))}
            {works.length === 0 && <p className="text-secondary">なし</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Units;
