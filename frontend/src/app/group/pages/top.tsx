import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";

const GroupTopPage = () => {
  const { currentGroup } = useAuthContext();

  if (!currentGroup) {
    raiseError("グループが選択されていません。");
    return <></>;
  }
  const [changedCurrentGroup, setChangedCurrentGroup] = useState(currentGroup);

  const handleSave = async () => {
    try {
      const result = await hc.apiv1.group[":id"].profile.$post({
        param: { id: currentGroup.id },
        json: {
          name: changedCurrentGroup.name,
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
    } catch (error) {
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
            value={changedCurrentGroup.name}
            setValueFunc={(e) =>
              setChangedCurrentGroup({
                ...changedCurrentGroup,
                name: e,
              })
            }
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
