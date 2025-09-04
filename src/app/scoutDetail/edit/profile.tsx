import InputGroupUI from "@/style/imputGroupUI";
import convertInputDate from "@/tools/date/convertInputDate";
import { ScoutPersonalData } from "@/types/scout/scout";
import { ScoutUnit, ScoutUnitNameMap } from "@/types/scout/scoutUnit";
import { InputGroup } from "react-bootstrap";

const Profile = ({
  scoutData,
  setScoutData,
}: {
  scoutData: ScoutPersonalData;
  setScoutData: React.Dispatch<React.SetStateAction<ScoutPersonalData>>;
}): React.ReactElement => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="mt-3 card">
            <div className="card-header">
              <h5 className="card-title mb-0">スカウトの基本情報</h5>
            </div>
            <div className="card-body">
              <p className="card-text">名前や登録番号など。</p>
              <div className="row mt-3">
                <div className="col-12 col-md-6">
                  <InputGroupUI
                    label="名前"
                    value={scoutData.name}
                    placeholder="松田 太郎"
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, name: e })
                    }
                  />
                  <InputGroupUI
                    label="登録番号"
                    type="number"
                    value={scoutData.ScoutId}
                    placeholder="1234567890"
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, ScoutId: e })
                    }
                  />
                  <InputGroupUI
                    label="生年月日"
                    type="date"
                    value={convertInputDate(scoutData.birthday)}
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, birthday: new Date(e) })
                    }
                  />
                  <InputGroupUI
                    label="入団の日"
                    type="date"
                    value={convertInputDate(scoutData.joinedDate)}
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, joinedDate: new Date(e) })
                    }
                  />
                </div>
                <div className="col-12 col-md-6 d-flex flex-column">
                  {/* セレクトボックスで所属隊(bs,vs)を指定 */}
                  <InputGroup className="mb-3">
                    <InputGroup.Text>現在の所属隊</InputGroup.Text>
                    <select
                      className="form-select"
                      value={scoutData.currentUnit}
                      onChange={(e) =>
                        setScoutData({
                          ...scoutData,
                          currentUnit: e.target.value as ScoutUnit,
                        })
                      }
                    >
                      {Object.entries(ScoutUnitNameMap).map(([unit, name]) => (
                        <option key={unit} value={unit}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </InputGroup>

                  <InputGroup className="mb-3 flex-grow-1 d-flex">
                    <InputGroup.Text>メモ</InputGroup.Text>
                    <textarea
                      className="form-control"
                      value={scoutData.memo}
                      style={{ resize: "none" }}
                      placeholder="スカウトに関するメモ"
                      onChange={(e) =>
                        setScoutData({
                          ...scoutData,
                          memo: e.target.value,
                        })
                      }
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 mt-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">ちかいについて</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                ちかいを立てた日付と場所を入力します。
              </p>
              <InputGroupUI
                label={scoutData.declare.isDone ? "取得済" : "未取得"}
                type="date"
                value={convertInputDate(scoutData.declare.date)}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    declare: {
                      ...scoutData.declare,
                      date: new Date(e),
                    },
                  })
                }
                chkbox={scoutData.declare.isDone}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    declare: {
                      ...scoutData.declare,
                      isDone: e,
                    },
                  })
                }
              />
              <InputGroupUI
                label="場所"
                value={scoutData.declare.place}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    declare: {
                      ...scoutData.declare,
                      place: e,
                    },
                  })
                }
                valueDisabled={!scoutData.declare.isDone}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 mt-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">信仰について</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                信仰奨励章の取得状況と日付を入力します。
              </p>
              <InputGroupUI
                label={scoutData.religion.faith.has ? "取得済" : "未取得"}
                type="date"
                value={convertInputDate(scoutData.religion.faith.date)}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      faith: {
                        ...scoutData.religion.faith,
                        date: new Date(e),
                      },
                    },
                  })
                }
                chkbox={scoutData.religion.faith.has}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      faith: {
                        ...scoutData.religion.faith,
                        has: e,
                      },
                    },
                  })
                }
              />
              <p className="card-text">宗教章の取得状況と日付を入力します。</p>
              <InputGroupUI
                label={scoutData.religion.religion.has ? "取得済" : "未取得"}
                type="date"
                value={convertInputDate(scoutData.religion.religion.date)}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      religion: {
                        ...scoutData.religion.religion,
                        date: new Date(e),
                      },
                    },
                  })
                }
                chkbox={scoutData.religion.religion.has}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      religion: {
                        ...scoutData.religion.religion,
                        has: e,
                      },
                    },
                  })
                }
              />
              <InputGroupUI
                label="種類"
                value={scoutData.religion.religion.type}
                valueDisabled={!scoutData.religion.religion.has}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      religion: {
                        ...scoutData.religion.religion,
                        type: e,
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Profile;
