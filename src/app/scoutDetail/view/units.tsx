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
                label="ベンチャースカウト章修了"
                value={
                  scoutDataUnit.vs.grade.venture.has
                    ? convertInputDate(scoutDataUnit.vs.grade.venture.date)
                    : "未修了"
                }
              />
              <ShowData
                label="隼スカウト章修了"
                value={
                  scoutDataUnit.vs.grade.falcon.has
                    ? convertInputDate(scoutDataUnit.vs.grade.falcon.date)
                    : "未修了"
                }
              />
              <ShowData
                label="富士スカウト章修了"
                value={
                  scoutDataUnit.vs.grade.fuji.has
                    ? convertInputDate(scoutDataUnit.vs.grade.fuji.date)
                    : "未修了"
                }
              />
            </>
          }
          works={scoutDataUnit.vs.works}
        />
      )}
      {scoutDataUnit.rs.experienced && (
        <UnitCard
          title="ローバー隊"
          joinedDate={convertInputDate(scoutDataUnit.rs.joinedDate)}
          works={scoutDataUnit.rs.works}
        />
      )}
    </div>
  );
};

const UnitCard: React.FC<{
  title: string;
  joinedDate: string;
  gradesNode?: React.ReactNode;
  works: Work[];
}> = ({ title, joinedDate, gradesNode, works }) => {
  return (
    <div className="mt-3 col-12 col-md-6">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row">
            <div className="flex-grow-1 mb-3">
              <h5>基本情報</h5>
              <ShowData label="入隊日時" value={convertInputDate(joinedDate)} />
            </div>
            {gradesNode && (
              <div className="flex-grow-1 mb-3">
                <h5>進級章</h5>
                {gradesNode}
              </div>
            )}
          </div>
          {works.length > 0 && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Units;
