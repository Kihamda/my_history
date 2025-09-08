import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import {
  ScoutUnitList,
  ScoutUnitNameMap,
  UnitExperience,
} from "@/types/scout/scoutUnit";

const Units = ({
  scoutDataUnit,
}: {
  scoutDataUnit: UnitExperience[];
}): React.ReactElement => {
  return (
    <div className="row">
      {ScoutUnitList.map((unit) => {
        const data = scoutDataUnit.find((u) => u.id === unit);

        // データが見つからない場合は何も表示しない
        if (!data) return null;

        // 入団経験がある場合の表示
        if (data.experienced) {
          return (
            <div key={data.id} className="mt-3 col-12 col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">{ScoutUnitNameMap[unit]}</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="flex-grow-1 mb-3">
                      <h5>基本情報</h5>
                      <ShowData
                        label="入隊日時"
                        value={convertInputDate(data.joinedDate)}
                      />
                    </div>
                    {data.grade.length > 0 && (
                      <div className="flex-grow-1 mb-3">
                        <h5>進級章</h5>
                        {data.grade.map((grade) => (
                          <ShowData
                            key={grade.id}
                            label={grade.name}
                            value={
                              grade.has
                                ? convertInputDate(grade.date)
                                : "未修了"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {data.works.length > 0 && (
                    <div>
                      <h5>スカウト役務 </h5>
                      {data.works.map((work, index) => (
                        <ShowData
                          key={index}
                          label={work.type}
                          value={
                            convertInputDate(work.begin) +
                            " ~ " +
                            convertInputDate(work.end)
                          }
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
          <div key={data.id} className="mt-3 col-12 col-md-6">
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
