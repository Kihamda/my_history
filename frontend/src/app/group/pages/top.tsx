import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";

const GroupTopPage = () => {
  const { currentGroup } = useAuthContext();
  const [changedGroupName, setChangedGroupName] = useState(
    currentGroup?.name ?? "",
  );

  if (!currentGroup) {
    raiseError("グループが選択されていません。");
    return <></>;
  }

  const handleSave = async () => {
    try {
      const result = await hc.apiv1.group[":id"].profile.$post({
        param: { id: currentGroup.id },
        json: {
          name: changedGroupName,
        },
      });
      if (result.status === 200) {
        raiseError("グループ情報を更新しました", "success");
      } else {
        raiseError(
          "グループの更新に失敗しました",
          "error",
          (await result.json()).message,
        );
      }
    } catch {
      raiseError("グループの更新に失敗しました。");
    }
  };

  return (
    <>
      <FullWidthCardHeader title="グループ設定" />
      <div className="mt-3 card">
        <div className="card-body">
          <InputGroupUI
            label="グループ名"
            value={changedGroupName}
            setValueFunc={setChangedGroupName}
          />
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </>
  );
};
export default GroupTopPage;
