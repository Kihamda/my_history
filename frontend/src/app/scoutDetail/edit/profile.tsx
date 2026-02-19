import type { ScoutData } from "@f/lib/api/apiTypes";
import { ScoutUnitNameMap } from "@f/lib/clientCommons/scout";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { InputGroup } from "react-bootstrap";

const Profile = ({
  scoutData,
  setScoutData,
}: {
  scoutData: ScoutData["personal"];
  setScoutData: React.Dispatch<React.SetStateAction<ScoutData["personal"]>>;
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
                    value={scoutData.scoutId}
                    placeholder="1234567890"
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, scoutId: e })
                    }
                  />
                  <InputGroupUI
                    label="生年月日"
                    type="date"
                    value={scoutData.birthDate}
                    setValueFunc={(e) =>
                      setScoutData({ ...scoutData, birthDate: e })
                    }
                  />
                  <InputGroupUI
                    label="入団の日"
                    type="date"
                    value={scoutData.joinedDate}
                    setValueFunc={(e) =>
                      setScoutData({
                        ...scoutData,
                        joinedDate: e,
                      })
                    }
                  />
                </div>
                <div className="col-12 col-md-6 d-flex flex-column">
                  {/* セレクトボックスで所属隊(bs,vs)を指定 */}
                  <InputGroup className="mb-3">
                    <InputGroup.Text>現在の所属隊</InputGroup.Text>
                    <select
                      className="form-select"
                      value={scoutData.currentUnitId}
                      onChange={(e) =>
                        setScoutData({
                          ...scoutData,
                          currentUnitId: e.target
                            .value as keyof typeof ScoutUnitNameMap,
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
                label={scoutData.declare.done ? "実施済" : "未実施"}
                type="date"
                value={scoutData.declare.date}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    declare: {
                      ...scoutData.declare,
                      date: e,
                    },
                  })
                }
                chkbox={scoutData.declare.done}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    declare: {
                      ...scoutData.declare,
                      done: e,
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
                valueDisabled={!scoutData.declare.done}
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
                label={scoutData.faith.done ? "取得済" : "未取得"}
                type="date"
                value={scoutData.faith.date}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    faith: {
                      ...scoutData.faith,
                      date: e,
                    },
                  })
                }
                chkbox={scoutData.faith.done}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    faith: {
                      ...scoutData.faith,
                      done: e,
                    },
                  })
                }
              />
              <p className="card-text">宗教章の取得状況と日付を入力します。</p>
              <InputGroupUI
                label={scoutData.religion.done ? "取得済" : "未取得"}
                type="date"
                value={scoutData.religion.date}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      date: e,
                    },
                  })
                }
                chkbox={scoutData.religion.done}
                setChkboxFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      done: e,
                    },
                  })
                }
              />
              <InputGroupUI
                label="種類"
                value={scoutData.religion.type}
                valueDisabled={!scoutData.religion.done}
                setValueFunc={(e) =>
                  setScoutData({
                    ...scoutData,
                    religion: {
                      ...scoutData.religion,
                      type: e,
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
