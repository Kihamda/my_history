import InputGroupUI from "@/style/imputGroupUI";
import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import {
  ScoutUnitList,
  ScoutUnitNameMap,
  UnitExperience,
  Work,
} from "@/types/scout/scoutUnit";
import { Button, InputGroup } from "react-bootstrap";

const Units = ({
  scoutDataUnit,
  setScoutDataUnit,
}: {
  scoutDataUnit: UnitExperience[];
  setScoutDataUnit: React.Dispatch<React.SetStateAction<UnitExperience[]>>;
}): React.ReactElement => {
  return (
    <div className="row">
      {ScoutUnitList.map((unit) => {
        const data = scoutDataUnit.find((u) => u.id === unit);

        // データが見つからない場合は何も表示しない
        if (!data) return null;

        return (
          <div key={data.id} className="mt-3 col-12 col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{ScoutUnitNameMap[data.id]}</h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column">
                  <div className=" mb-3">
                    <h5>基本情報</h5>
                    <InputGroupUI
                      label={data.experienced ? "入団済" : "未入団"}
                      value={convertInputDate(data.joinedDate)}
                      setValueFunc={(e) => {
                        setScoutDataUnit((prev) =>
                          prev.map((u) =>
                            u.id === data.id
                              ? { ...u, joinedDate: new Date(e) }
                              : u
                          )
                        );
                      }}
                      type="date"
                      chkbox={data.experienced}
                      setChkboxFunc={(experienced) => {
                        setScoutDataUnit((prev) =>
                          prev.map((u) =>
                            u.id === data.id ? { ...u, experienced } : u
                          )
                        );
                      }}
                    />
                  </div>
                  {data.experienced ? (
                    <>
                      {data.grade.length > 0 && (
                        <div className="mb-3">
                          <h5>進級章</h5>

                          {data.grade.map((grade, index) => (
                            <InputGroupUI
                              key={index}
                              label={
                                grade.name +
                                (grade.has ? " (修了)" : " (未修了)")
                              }
                              chkbox={grade.has}
                              setChkboxFunc={(has) => {
                                setScoutDataUnit((prev) =>
                                  prev.map((u) =>
                                    u.id === data.id
                                      ? {
                                          ...u,
                                          grade: u.grade.map((g) =>
                                            g.id === grade.id
                                              ? { ...g, has }
                                              : g
                                          ),
                                        }
                                      : u
                                  )
                                );
                              }}
                              value={convertInputDate(grade.date)}
                              setValueFunc={(date) => {
                                setScoutDataUnit((prev) =>
                                  prev.map((u) =>
                                    u.id === data.id
                                      ? {
                                          ...u,
                                          grade: u.grade.map((g) =>
                                            g.id === grade.id
                                              ? { ...g, date: new Date(date) }
                                              : g
                                          ),
                                        }
                                      : u
                                  )
                                );
                              }}
                              type="date"
                            />
                          ))}
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <h5>スカウト役務</h5>
                        <Button
                          variant="primary"
                          className="text-end"
                          onClick={() => {
                            const newWork: Work = {
                              type: "",
                              begin: new Date(),
                              end: new Date(),
                            };
                            setScoutDataUnit((prev) =>
                              prev.map((u) =>
                                u.id === data.id
                                  ? { ...u, works: [...u.works, newWork] }
                                  : u
                              )
                            );
                          }}
                        >
                          役務を追加
                        </Button>
                      </div>

                      <div
                        className="mt-2 pt-2"
                        style={{ borderTop: "1px solid #000000ff" }}
                      >
                        {data.works.map((work, index) => (
                          <div
                            className="pb-2 mb-2"
                            style={{ borderBottom: "1px solid #000000ff" }}
                            key={index}
                          >
                            <InputGroupUI
                              label="役務名"
                              value={work.type}
                              setValueFunc={(type) => {
                                setScoutDataUnit((prev) =>
                                  prev.map((u) =>
                                    u.id === data.id
                                      ? {
                                          ...u,
                                          works: u.works.map((w, i) =>
                                            i === index ? { ...w, type } : w
                                          ),
                                        }
                                      : u
                                  )
                                );
                              }}
                            />
                            <InputGroup>
                              <InputGroup.Text>期間</InputGroup.Text>
                              <input
                                type="date"
                                className="form-control"
                                value={convertInputDate(work.begin)}
                                onChange={(e) => {
                                  const newDate = new Date(e.target.value);
                                  setScoutDataUnit((prev) =>
                                    prev.map((u) =>
                                      u.id === data.id
                                        ? {
                                            ...u,
                                            works: u.works.map((w, i) =>
                                              i === index
                                                ? { ...w, begin: newDate }
                                                : w
                                            ),
                                          }
                                        : u
                                    )
                                  );
                                }}
                              />
                              <InputGroup.Text> ~ </InputGroup.Text>

                              <input
                                type="date"
                                className="form-control"
                                value={convertInputDate(work.end)}
                                onChange={(e) => {
                                  const newDate = new Date(e.target.value);
                                  setScoutDataUnit((prev) =>
                                    prev.map((u) =>
                                      u.id === data.id
                                        ? {
                                            ...u,
                                            works: u.works.map((w, i) =>
                                              i === index
                                                ? { ...w, end: newDate }
                                                : w
                                            ),
                                          }
                                        : u
                                    )
                                  );
                                }}
                              />
                            </InputGroup>
                            <div className="text-end mt-2">
                              <Button
                                variant="danger"
                                onClick={() => {
                                  setScoutDataUnit((prev) =>
                                    prev.map((u) =>
                                      u.id === data.id
                                        ? {
                                            ...u,
                                            works: u.works.filter(
                                              (_, i) => i !== index
                                            ),
                                          }
                                        : u
                                    )
                                  );
                                }}
                              >
                                削除
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>
                      記録がありません。上の「未入団」チェックボックスで記録を追加します。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Units;
