import { useState } from "react";
import {
  Scout,
  ScoutPersonalData,
  ScoutPersonalDataDefault,
} from "@/types/frontend/scout/scout";
import { getOptedUnitDataDefault } from "@/types/frontend/scout/unit";
import { useAuthContext } from "@/backend/authContext";
import { setScoutRecord } from "@/backend/scoutDb/scout";
import { Navigate, useNavigate } from "react-router";
import convertInputDate from "@/tools/date/convertInputDate";
import getRandomStr from "@/tools/getRandomStr";
import { raiseError } from "@/frontend/errorHandler";
import FullWidthCardHeader from "@/frontend/style/fullWidthCardHeader";
import InputGroupUI from "@/frontend/style/imputGroupUI";

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

  const handleSave = async (personalData: ScoutPersonalData) => {
    const unit = await getOptedUnitDataDefault(scoutData.birthday);
    const newScoutData: Scout = {
      id: getRandomStr(20),
      personal: personalData,
      unit: unit,
      ginosho: [],
      events: [],
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
                setValueFunc={(e) => setScoutData({ ...scoutData, ScoutId: e })}
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
          <button
            className="btn btn-primary"
            onClick={() => {
              handleSave(scoutData);
            }}
          >
            記録を作成
          </button>
        </div>
      </div>
    </>
  );
};
export default NewScoutWizard;
