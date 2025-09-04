import { useState } from "react";
import {
  Scout,
  ScoutPersonalData,
  ScoutPersonalDataDefault,
} from "@/types/scout/scout";
import { ScoutUnitDataDefault } from "@/types/scout/scoutUnit";
import { useAuthContext } from "@/firebase/authContext";
import { setScoutRecord } from "@/firebase/scoutDb/scout";
import { Navigate, useNavigate } from "react-router";
import convertInputDate from "@/tools/date/convertInputDate";
import guessDates from "./new/guessDates";
import getRandomStr from "@/tools/getRandomStr";
import { raiseError } from "@/errorHandler";
import FullWidthCardHeader from "@/style/fullWidthCardHeader";
import Profile from "./edit/profile";
import InputGroupUI from "@/style/imputGroupUI";

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
      nav(`/app/scouts/${result.data.id}/view`, {
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
      {!everGuessed ? (
        <div className="mt-3 card">
          <div className="card-body">
            <h4 className="card-title">はじめに</h4>
            <p className="card-text">
              名前と登録番号、生年月日を入力してください。「入団日時」など他の入力欄の初期値を推測できます(入力済みの内容は上書きされます。何回も押せます。)。
            </p>
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <InputGroupUI
                  label="名前"
                  value={scoutData.name}
                  placeholder="松田 太郎"
                  setValueFunc={(e) => setScoutData({ ...scoutData, name: e })}
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
              </div>
              <div className="col-12 col-md-6 mb-3">
                <InputGroupUI
                  label="生年月日"
                  type="date"
                  value={convertInputDate(scoutData.birthday)}
                  setValueFunc={(e) =>
                    setScoutData({ ...scoutData, birthday: new Date(e) })
                  }
                />
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-center">
            <button className="btn btn-primary" onClick={handleGuessDates}>
              次へ
            </button>
          </div>
        </div>
      ) : (
        <>
          <Profile scoutData={scoutData} setScoutData={setScoutData} />
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
      )}
    </>
  );
};
export default NewScoutWizard;
