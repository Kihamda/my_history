import { useState } from "react";
import { Scout, ScoutPersonalDataDefault } from "@/types/scout/scout";
import {
  ScoutUnit,
  ScoutUnitDataDefault,
  ScoutUnitNameMap,
} from "@/types/scout/scoutUnit";
import getRandomStr from "@/tools/getRandomStr";
import { InputGroup } from "react-bootstrap";
import { useAuthContext } from "@/firebase/authContext";
import { Navigate } from "react-router";
import convertInputDate from "@/tools/convertInputDate";
import guessDates from "./guessDates";

const NewScoutWizard = () => {
  const user = useAuthContext();

  if (!user?.joinGroupId) {
    return <Navigate to="/login" replace />;
  }

  const [scoutData, setScoutData] = useState<Scout>({
    id: getRandomStr(20), // ユニークIDを生成
    personal: { ...ScoutPersonalDataDefault, belongs: user?.joinGroupId },
    unit: ScoutUnitDataDefault,
  });

  const [everGuessed, setEverGuessed] = useState(false);
  const handleGuessDates = () => {
    setScoutData(guessDates(scoutData));
    setEverGuessed(true);
  };

  // 新規スカウト記録の作成ウィザードコンポーネント
  // スカウトの完全なpersonalデータとユニットデータ(入隊日時or経験くらい)までを入力するよう促す

  return (
    <>
      <div className="card">
        <div className="card-body d-flex flex-wrap">
          <div className="flex-grow-1">
            <h3 className="card-title">新規スカウト記録の作成</h3>
            <p className="card-text">
              ここで新しいスカウトを作成できます。ここで設定した情報はあとから編集できます。
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 card">
        <div className="card-body">
          <h4 className="card-title">スカウトの基本情報</h4>
          <p className="card-text">
            名前や登録番号など。生年月日を入力すると「入団日時」など他の入力欄の初期値を推測できます(入力済みの内容は上書きされます。何回も押せます。)。
          </p>
          <div className="row mt-3">
            <div className="col-12 col-md-6">
              <InputGroup className="mb-3">
                <InputGroup.Text>名前</InputGroup.Text>
                <input
                  type="text"
                  className="form-control"
                  value={scoutData.personal.name}
                  placeholder="松田 太郎"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>登録番号</InputGroup.Text>
                <input
                  type="number"
                  className="form-control"
                  value={scoutData.personal.ScoutId}
                  placeholder="1234567890"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        ScoutId: e.target.value,
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>生年月日</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.personal.birthday)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        birthday: new Date(e.target.value),
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>入団の日</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.personal.joinedDate)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        joinedDate: new Date(e.target.value),
                      },
                    })
                  }
                />
              </InputGroup>
            </div>
            <div className="col-12 col-md-6 d-flex flex-column">
              {/* セレクトボックスで所属隊(bs,vs)を指定 */}
              <InputGroup className="mb-3">
                <InputGroup.Text>現在の所属隊</InputGroup.Text>
                <select
                  className="form-select"
                  value={scoutData.personal.currentUnit}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        currentUnit: e.target.value as ScoutUnit,
                      },
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
                  value={scoutData.personal.memo}
                  style={{ resize: "none" }}
                  placeholder="スカウトに関するメモ"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        memo: e.target.value,
                      },
                    })
                  }
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between flex-wrap">
          <span>
            ボタンを押すと、入力済みの内容は上書きされます。何回も押せます。
          </span>
          <button
            className={
              "btn " + (everGuessed ? " btn-outline-secondary" : " btn-primary")
            }
            onClick={handleGuessDates}
          >
            誕生日から他の日付を推測する
          </button>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">ちかいについて</h4>
              <p className="card-text">
                ちかいを立てた日付と場所を入力します。
              </p>
              <InputGroup className="mb-3">
                <InputGroup.Text>日付</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.personal.declare.date)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        declare: {
                          ...scoutData.personal.declare,
                          date: new Date(e.target.value),
                        },
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>場所</InputGroup.Text>
                <input
                  type="text"
                  className="form-control"
                  value={scoutData.personal.declare.place}
                  placeholder="キャンプ場名や市区町村"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        declare: {
                          ...scoutData.personal.declare,
                          place: e.target.value,
                        },
                      },
                    })
                  }
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">信仰について</h4>
              <p className="card-text">
                信仰奨励章の日付と宗教章の日付を入力します。
              </p>
              <InputGroup className="mb-3">
                <InputGroup.Text>信仰奨励章</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(
                    scoutData.personal.religion.faith.date
                  )}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        religion: {
                          ...scoutData.personal.religion,
                          faith: {
                            ...scoutData.personal.religion.faith,
                            date: new Date(e.target.value),
                          },
                        },
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>宗教章</InputGroup.Text>
                <input
                  type="text"
                  className="form-control"
                  value={scoutData.personal.declare.place}
                  placeholder="キャンプ場名や市区町村"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      personal: {
                        ...scoutData.personal,
                        declare: {
                          ...scoutData.personal.declare,
                          place: e.target.value,
                        },
                      },
                    })
                  }
                />
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default NewScoutWizard;
