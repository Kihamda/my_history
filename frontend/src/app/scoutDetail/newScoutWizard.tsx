import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { raiseError } from "@f/errorHandler";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { apiJson, hc } from "@f/lib/api/api";
import type { ScoutCreate } from "@f/lib/api/apiTypes";
import { useAuthContext } from "@f/authContext";
import { useMutation } from "@tanstack/react-query";

const NewScoutWizard = () => {
  const nav = useNavigate();
  const { currentGroup } = useAuthContext();

  const [scoutData, setScoutData] = useState<ScoutCreate>({
    name: "",
    scoutId: "",
    birthDate: "",
    belongGroupId: currentGroup?.id || "",
  });

  const createMutation = useMutation({
    mutationFn: (newScoutData: ScoutCreate) =>
      apiJson<{ id: string }>(
        hc.apiv1.scout.create.$post({
          json: {
            ...newScoutData,
            name: newScoutData.name.trim(),
            scoutId: newScoutData.scoutId.trim(),
          },
        }),
        "スカウトデータの保存に失敗しました。",
      ),
    onSuccess: ({ id }) => {
      nav(`/app/scouts/${id}/view`, {
        replace: true,
      });
    },
  });

  const handleSave = () => {
    if (!scoutData.name.trim()) {
      raiseError("名前を入力してください。");
      return;
    }
    if (!/^\d{9,12}$/.test(scoutData.scoutId.trim())) {
      raiseError("登録番号は9〜12桁の数字で入力してください。");
      return;
    }
    if (!scoutData.birthDate) {
      raiseError("生年月日を入力してください。");
      return;
    }
    createMutation.mutate(scoutData);
  };

  if (!currentGroup || scoutData.belongGroupId == "") {
    return <Navigate to="/app/scouts" replace />;
  }

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
                value={scoutData.scoutId}
                placeholder="1234567890"
                setValueFunc={(e) => setScoutData({ ...scoutData, scoutId: e })}
              />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <InputGroupUI
                label="生年月日"
                type="date"
                value={scoutData.birthDate}
                setValueFunc={(e) =>
                  setScoutData({ ...scoutData, birthDate: e })
                }
              />
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-center">
          <button
            className="btn btn-primary"
            disabled={createMutation.isPending}
            onClick={handleSave}
          >
            {createMutation.isPending ? "作成中" : "記録を作成"}
          </button>
        </div>
      </div>
    </>
  );
};
export default NewScoutWizard;
