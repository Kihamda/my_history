import type { ScoutData } from "@/lib/api/apiTypes";
import { ScoutUnitNameMap, UnitIdList } from "@/lib/clientCommons/scout";
import { gradeMap } from "@/lib/master/grades";
import ShowData from "@/style/showData";

const Units = ({
  scoutDataUnit,
}: {
  scoutDataUnit: ScoutData["unit"];
}): React.ReactElement => {
  return (
    <div className="row">
      {UnitIdList.map((unit) => {
        const data = scoutDataUnit[unit];
        // 入団経験がある場合の表示
        if (data.experienced) {
          return (
            <div key={unit} className="mt-3 col-12 col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">{ScoutUnitNameMap[unit]}</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="flex-grow-1 mb-3">
                      <h5>基本情報</h5>
                      <ShowData label="入隊日時" value={data.joinedDate} />
                    </div>
                    {data.grade.length > 0 && (
                      <div className="flex-grow-1 mb-3">
                        <h5>進級章</h5>
                        {data.grade.map((grade) => (
                          <ShowData
                            key={grade.uniqueId}
                            label={gradeMap[unit][grade.uniqueId].name}
                            value={
                              grade.completed ? grade.completedDate : "未修了"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {data.work.length > 0 && (
                    <div>
                      <h5>スカウト役務 </h5>
                      {data.work.map((work, index) => (
                        <ShowData
                          key={index}
                          label={work.name}
                          value={work.begin + " ~ " + work.end}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // 入団経験がない場合のフォールバック
        return (
          <div key={unit} className="mt-3 col-12 col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{ScoutUnitNameMap[unit]}</h5>
              </div>
              <div className="card-body">
                <p>記録がありません。</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Units;
