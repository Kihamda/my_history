import InputGroupUI from "@/style/imputGroupUI";
import ShowData from "@/style/showData";
import convertInputDate from "@/tools/date/convertInputDate";
import { UnitExperience, Work } from "@/types/scout/scoutUnit";

const Units = ({
  scoutDataUnit,
  setScoutDataUnit,
}: {
  scoutDataUnit: UnitExperience;
  setScoutDataUnit: React.Dispatch<React.SetStateAction<UnitExperience>>;
}): React.ReactElement => {
  return (
    <div className="row">
      {scoutDataUnit.bvs.experienced && (
        <UnitCard
          title="ビーバー隊"
          joinedDate={scoutDataUnit.bvs.joinedDate}
          setJoinedDate={(date) =>
            setScoutDataUnit((prev) => ({
              ...prev,
              bvs: { ...prev.bvs, joinedDate: date },
            }))
          }
          gradesNode={[
            {
              label: "ビーバー",
              value: scoutDataUnit.bvs.grade.beaver,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bvs: {
                    ...prev.bvs,
                    grade: {
                      ...prev.bvs.grade,
                      beaver: { ...prev.bvs.grade.beaver, date, has },
                    },
                  },
                })),
            },
            {
              label: "ビッグビーバー",
              value: scoutDataUnit.bvs.grade.bigbeaver,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bvs: {
                    ...prev.bvs,
                    grade: {
                      ...prev.bvs.grade,
                      bigbeaver: { ...prev.bvs.grade.bigbeaver, date, has },
                    },
                  },
                })),
            },
          ]}
          works={scoutDataUnit.bvs.works}
        />
      )}

      {scoutDataUnit.cs.experienced && (
        <UnitCard
          title="カブ隊"
          joinedDate={scoutDataUnit.cs.joinedDate}
          setJoinedDate={(date) =>
            setScoutDataUnit((prev) => ({
              ...prev,
              cs: { ...prev.cs, joinedDate: date },
            }))
          }
          gradesNode={[
            {
              label: "うさぎ",
              value: scoutDataUnit.cs.grade.rabbit,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  cs: {
                    ...prev.cs,
                    grade: {
                      ...prev.cs.grade,
                      rabbit: { ...prev.cs.grade.rabbit, date, has },
                    },
                  },
                })),
            },
            {
              label: "しか",
              value: scoutDataUnit.cs.grade.deer,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  cs: {
                    ...prev.cs,
                    grade: {
                      ...prev.cs.grade,
                      deer: { ...prev.cs.grade.deer, date, has },
                    },
                  },
                })),
            },
            {
              label: "くま",
              value: scoutDataUnit.cs.grade.bear,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  cs: {
                    ...prev.cs,
                    grade: {
                      ...prev.cs.grade,
                      bear: { ...prev.cs.grade.bear, date, has },
                    },
                  },
                })),
            },
          ]}
          works={scoutDataUnit.cs.works}
        />
      )}

      {scoutDataUnit.bs.experienced && (
        <UnitCard
          title="ボーイ隊"
          joinedDate={scoutDataUnit.bs.joinedDate}
          setJoinedDate={(date) =>
            setScoutDataUnit((prev) => ({
              ...prev,
              bs: { ...prev.bs, joinedDate: date },
            }))
          }
          gradesNode={[
            {
              label: "初級スカウト章",
              value: scoutDataUnit.bs.grade.beginner,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bs: {
                    ...prev.bs,
                    grade: {
                      ...prev.bs.grade,
                      beginner: { ...prev.bs.grade.beginner, date, has },
                    },
                  },
                })),
            },
            {
              label: "2級スカウト章",
              value: scoutDataUnit.bs.grade.second,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bs: {
                    ...prev.bs,
                    grade: {
                      ...prev.bs.grade,
                      second: { ...prev.bs.grade.second, date, has },
                    },
                  },
                })),
            },
            {
              label: "1級スカウト章",
              value: scoutDataUnit.bs.grade.first,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bs: {
                    ...prev.bs,
                    grade: {
                      ...prev.bs.grade,
                      first: { ...prev.bs.grade.first, date, has },
                    },
                  },
                })),
            },
            {
              label: "菊スカウト章",
              value: scoutDataUnit.bs.grade.mum,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  bs: {
                    ...prev.bs,
                    grade: {
                      ...prev.bs.grade,
                      mum: { ...prev.bs.grade.mum, date, has },
                    },
                  },
                })),
            },
          ]}
          works={scoutDataUnit.bs.works}
        />
      )}

      {scoutDataUnit.vs.experienced && (
        <UnitCard
          title="ベンチャー隊"
          joinedDate={scoutDataUnit.vs.joinedDate}
          setJoinedDate={(date) =>
            setScoutDataUnit((prev) => ({
              ...prev,
              vs: { ...prev.vs, joinedDate: date },
            }))
          }
          gradesNode={[
            {
              label: "ベンチャースカウト章",
              value: scoutDataUnit.vs.grade.venture,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  vs: {
                    ...prev.vs,
                    grade: {
                      ...prev.vs.grade,
                      venture: { ...prev.vs.grade.venture, date, has },
                    },
                  },
                })),
            },
            {
              label: "隼スカウト章",
              value: scoutDataUnit.vs.grade.falcon,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  vs: {
                    ...prev.vs,
                    grade: {
                      ...prev.vs.grade,
                      falcon: { ...prev.vs.grade.falcon, date, has },
                    },
                  },
                })),
            },
            {
              label: "富士スカウト章",
              value: scoutDataUnit.vs.grade.fuji,
              setValue: (date, has) =>
                setScoutDataUnit((prev) => ({
                  ...prev,
                  vs: {
                    ...prev.vs,
                    grade: {
                      ...prev.vs.grade,
                      fuji: { ...prev.vs.grade.fuji, date, has },
                    },
                  },
                })),
            },
          ]}
          works={scoutDataUnit.vs.works}
        />
      )}

      {scoutDataUnit.rs.experienced && (
        <UnitCard
          title="ローバー隊"
          joinedDate={scoutDataUnit.rs.joinedDate}
          setJoinedDate={(date) =>
            setScoutDataUnit((prev) => ({
              ...prev,
              rs: { ...prev.rs, joinedDate: date },
            }))
          }
          works={scoutDataUnit.rs.works}
        />
      )}
    </div>
  );
};

const UnitCard: React.FC<{
  title: string;
  joinedDate: Date;
  setJoinedDate: (date: Date) => void;
  gradesNode?: Array<{
    label: string;
    value: { date: Date; has: boolean };
    setValue: (value: Date, chk: boolean) => void;
  }>;
  works: Work[];
}> = ({ title, joinedDate, setJoinedDate, gradesNode, works }) => {
  return (
    <div className="mt-3 col-12 col-md-6">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-column">
            <div className=" mb-3">
              <h5>基本情報</h5>
              <InputGroupUI
                label="入団日時"
                value={convertInputDate(joinedDate)}
                setValueFunc={(e) => {
                  setJoinedDate(new Date(e));
                }}
                type="date"
              />
            </div>
            {gradesNode && (
              <div className=" mb-3">
                <h5>進級章</h5>
                {gradesNode.map((grade, index) => (
                  <InputGroupUI
                    key={index}
                    label={
                      grade.label + (grade.value.has ? " (修了)" : " (未修了)")
                    }
                    chkbox={grade.value.has}
                    setChkboxFunc={(has) => {
                      grade.setValue(grade.value.date, has);
                    }}
                    value={convertInputDate(grade.value.date)}
                    setValueFunc={(date) => {
                      grade.setValue(new Date(date), grade.value.has);
                    }}
                    type="date"
                  />
                ))}
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
