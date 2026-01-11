import InputGroupUI from "@f/style/imputGroupUI";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { ScoutUnitNameMap, UnitIdList } from "@f/lib/clientCommons/scout";

import { Button, InputGroup } from "react-bootstrap";
import { gradeMap } from "@f/lib/master/grades";

const Units = ({
  scoutDataUnit,
  setScoutDataUnit,
}: {
  scoutDataUnit: ScoutData["unit"];
  setScoutDataUnit: React.Dispatch<React.SetStateAction<ScoutData["unit"]>>;
}): React.ReactElement => {
  return (
    <div className="row">
      {UnitIdList.map((unit, index) => {
        const master = gradeMap[unit];
        const data = scoutDataUnit[unit];
        const name = ScoutUnitNameMap[unit];

        return (
          <div key={index} className="mt-3 col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">{name}</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <h5>基本情報</h5>
                      <InputGroupUI
                        label={data.experienced ? "入団済" : "未入団"}
                        value={data.joinedDate}
                        setValueFunc={(e) => {
                          setScoutDataUnit((prev) => {
                            return {
                              ...prev,
                              [unit]: { ...data, joinedDate: e },
                            };
                          });
                        }}
                        type="date"
                        chkbox={data.experienced}
                        setChkboxFunc={(experienced) => {
                          setScoutDataUnit((prev) => {
                            return {
                              ...prev,
                              [unit]: { ...data, experienced },
                            };
                          });
                        }}
                      />
                    </div>
                    {data.experienced && (
                      <div className="mb-3">
                        <h5>進級章</h5>

                        {Object.entries(master).map(([key, value]) => {
                          const grade = data.grade.find(
                            (g) => g.uniqueId === key
                          ) || {
                            uniqueId: key,
                            completed: false,
                            completedDate: "",
                            details: value.details.map(() => ({
                              done: false,
                              achievedDate: "",
                            })),
                          };

                          return (
                            <InputGroupUI
                              key={index + "_" + key}
                              label={
                                value.name +
                                (grade.completed ? " (修了)" : " (未修了)")
                              }
                              chkbox={grade.completed}
                              setChkboxFunc={(completed) => {
                                setScoutDataUnit((prev) => {
                                  if (
                                    data.grade.findIndex(
                                      (g) => g.uniqueId === key
                                    ) === -1
                                  ) {
                                    // 新規追加
                                    return {
                                      ...prev,
                                      [unit]: {
                                        ...data,
                                        grade: [
                                          ...data.grade,
                                          {
                                            ...grade,
                                            completed: completed ? true : false,
                                          },
                                        ],
                                      },
                                    };
                                  }
                                  return {
                                    ...prev,
                                    [unit]: {
                                      ...data,
                                      grade: data.grade.map((g) =>
                                        g.uniqueId === grade.uniqueId
                                          ? {
                                              ...g,
                                              completed: completed
                                                ? true
                                                : false,
                                            }
                                          : g
                                      ),
                                    },
                                  };
                                });
                              }}
                              value={grade.completedDate}
                              setValueFunc={(date) => {
                                setScoutDataUnit((prev) => {
                                  return {
                                    ...prev,
                                    [unit]: {
                                      ...data,
                                      grade: data.grade.map((g) =>
                                        g.uniqueId === grade.uniqueId
                                          ? { ...g, completedDate: date }
                                          : g
                                      ),
                                    },
                                  };
                                });
                              }}
                              type="date"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6">
                    {data.experienced ? (
                      <>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5>スカウト役務</h5>
                          <Button
                            variant="primary"
                            className="text-end"
                            onClick={() => {
                              const newWork: ScoutData["unit"]["bs"]["work"][number] =
                                {
                                  name: "",
                                  begin: "",
                                  end: "",
                                };
                              setScoutDataUnit((prev) => {
                                return {
                                  ...prev,
                                  [unit]: {
                                    ...data,
                                    work: [...data.work, newWork],
                                  },
                                };
                              });
                            }}
                          >
                            役務を追加
                          </Button>
                        </div>

                        <div
                          className="mt-2 pt-2"
                          style={{ borderTop: "1px solid #000000ff" }}
                        >
                          {data.work.map((work, index) => (
                            <div
                              className="pb-2 mb-2"
                              style={{ borderBottom: "1px solid #000000ff" }}
                              key={index}
                            >
                              <InputGroupUI
                                label="役務名"
                                value={work.name}
                                setValueFunc={(name) => {
                                  setScoutDataUnit((prev) => {
                                    return {
                                      ...prev,
                                      [unit]: {
                                        ...data,
                                        work: data.work.map((w, i) =>
                                          i === index ? { ...w, name } : w
                                        ),
                                      },
                                    };
                                  });
                                }}
                              />
                              <InputGroup>
                                <InputGroup.Text>期間</InputGroup.Text>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={work.begin}
                                  onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    setScoutDataUnit((prev) => {
                                      return {
                                        ...prev,
                                        [unit]: {
                                          ...data,
                                          work: data.work.map((w, i) =>
                                            i === index
                                              ? {
                                                  ...w,
                                                  begin: newDate
                                                    .toISOString()
                                                    .split("T")[0],
                                                }
                                              : w
                                          ),
                                        },
                                      };
                                    });
                                  }}
                                />
                                <InputGroup.Text> ~ </InputGroup.Text>

                                <input
                                  type="date"
                                  className="form-control"
                                  value={work.end || ""}
                                  onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    setScoutDataUnit((prev) => {
                                      return {
                                        ...prev,
                                        [unit]: {
                                          ...data,
                                          work: data.work.map((w, i) =>
                                            i === index
                                              ? {
                                                  ...w,
                                                  end: newDate
                                                    .toISOString()
                                                    .split("T")[0],
                                                }
                                              : w
                                          ),
                                        },
                                      };
                                    });
                                  }}
                                />
                              </InputGroup>
                              <div className="text-end mt-2">
                                <Button
                                  variant="danger"
                                  onClick={() => {
                                    setScoutDataUnit((prev) => {
                                      return {
                                        ...prev,
                                        [unit]: {
                                          ...data,
                                          work: data.work.filter(
                                            (_, i) => i !== index
                                          ),
                                        },
                                      };
                                    });
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
          </div>
        );
      })}
    </div>
  );
};

export default Units;
