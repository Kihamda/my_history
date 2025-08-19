import { useState } from "react";
import {
  Scout,
  ScoutPersonalData,
  ScoutPersonalDataDefault,
} from "@/types/scout/scout";
import {
  ScoutUnit,
  ScoutUnitDataDefault,
  ScoutUnitNameMap,
} from "@/types/scout/scoutUnit";
import { InputGroup } from "react-bootstrap";
import { useAuthContext } from "@/firebase/authContext";
import setScoutRecord from "@/firebase/scoutDb/setScoutData";
import { Navigate, useNavigate } from "react-router";
import convertInputDate from "@/tools/date/convertInputDate";
import guessDates from "./guessDates";
import getRandomStr from "@/tools/getRandomStr";
import { raiseError } from "@/errorHandler";
import FullWidthCardHeader from "@/types/style/fullWidthCardHeader";

const NewScoutWizard = () => {
  const user = useAuthContext();
  const nav = useNavigate();

  if (!user?.joinGroupId) {
    return <Navigate to="/login" replace />;
  }

  const [scoutData, setScoutData] = useState<ScoutPersonalData>({
    ...ScoutPersonalDataDefault,
    belongs: user?.joinGroupId,
  });

  const [everGuessed, setEverGuessed] = useState(false);
  const handleGuessDates = () => {
    setScoutData(
      guessDates({ id: "", personal: scoutData, unit: ScoutUnitDataDefault })
        .personal
    );
    setEverGuessed(true);
  };

  const handleSave = async (personalData: ScoutPersonalData) => {
    const newScoutData: Scout = {
      id: getRandomStr(20),
      personal: personalData,
      unit: guessDates({
        id: "",
        personal: scoutData,
        unit: ScoutUnitDataDefault,
      }).unit,
    };

    const result = await setScoutRecord(newScoutData);
    if (result.status === "success") {
      // 保存成功時はスカウトの詳細ページにリダイレクト
      nav(`/app/scout/${result.data.id}`, {
        replace: true,
        state: { scout: newScoutData },
      });
    } else {
      // エラー処理
      raiseError("スカウトデータの保存に失敗しました。");
    }
  };

  // 新規スカウト記録の作成ウィザードコンポーネント
  // スカウトの完全なpersonalデータとユニットデータ(入隊日時or経験くらい)までを入力するよう促す

  return (
    <>
      <FullWidthCardHeader
        title="新規スカウト記録の作成"
        memo="ここで新しいスカウトを作成できます。ここで設定した情報はあとから編集できます。"
      />
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
                  value={scoutData.name}
                  placeholder="松田 太郎"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      name: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>登録番号</InputGroup.Text>
                <input
                  type="number"
                  className="form-control"
                  value={scoutData.ScoutId}
                  placeholder="1234567890"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      ScoutId: e.target.value,
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>生年月日</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.birthday)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      birthday: new Date(e.target.value),
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>入団の日</InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.joinedDate)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      joinedDate: new Date(e.target.value),
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
      <div className="row">
        <div className="col-12 col-md-6 mt-3">
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
                  value={convertInputDate(scoutData.declare.date)}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      declare: {
                        ...scoutData.declare,
                        date: new Date(e.target.value),
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
                  value={scoutData.declare.place}
                  placeholder="キャンプ場名や市区町村"
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      declare: {
                        ...scoutData.declare,
                        place: e.target.value,
                      },
                    })
                  }
                />
              </InputGroup>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 mt-3">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">信仰について</h4>
              <p className="card-text">
                信仰奨励章の日付と宗教章の日付を入力します。
              </p>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <input
                    type="checkbox"
                    className="form-check-input me-1"
                    name="faith"
                    id="faith"
                    value={scoutData.religion.faith.has ? "checked" : ""}
                    onChange={(e) =>
                      setScoutData({
                        ...scoutData,
                        religion: {
                          ...scoutData.religion,
                          faith: {
                            ...scoutData.religion.faith,
                            has: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                  {scoutData.religion.faith.has ? "取得済" : "未取得"}
                  ：信仰奨励章
                </InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.religion.faith.date)}
                  disabled={!scoutData.religion.faith.has}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      religion: {
                        ...scoutData.religion,
                        faith: {
                          ...scoutData.religion.faith,
                          date: new Date(e.target.value),
                        },
                      },
                    })
                  }
                />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <input
                    type="checkbox"
                    className="form-check-input me-1"
                    name="religion"
                    id="religion"
                    value={scoutData.religion.religion.has ? "checked" : ""}
                    onChange={(e) =>
                      setScoutData({
                        ...scoutData,
                        religion: {
                          ...scoutData.religion,
                          religion: {
                            ...scoutData.religion.religion,
                            has: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                  {scoutData.religion.religion.has ? "取得済" : "未取得"}
                  ：宗教章
                </InputGroup.Text>
                <input
                  type="date"
                  className="form-control"
                  value={convertInputDate(scoutData.religion.faith.date)}
                  disabled={!scoutData.religion.religion.has}
                  onChange={(e) =>
                    setScoutData({
                      ...scoutData,
                      religion: {
                        ...scoutData.religion,
                        faith: {
                          ...scoutData.religion.faith,
                          date: new Date(e.target.value),
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
      <div className="mt-3 card mb-3">
        <div className="card-body">
          <h4 className="card-title">終了</h4>
          <p className="card-text">
            ここまで入力した内容で新しいスカウト記録を作成します。スカウトの詳細ページに移動します。
          </p>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                handleSave(scoutData);
              }}
            >
              完了して保存する
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default NewScoutWizard;
