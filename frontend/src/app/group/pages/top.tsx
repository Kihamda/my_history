import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { apiJson, hc, queryClient } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

const GroupTopPage = () => {
  const { currentGroup } = useAuthContext();
  const [changedGroupName, setChangedGroupName] = useState(
    currentGroup?.name ?? "",
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentGroup) {
        throw new Error("グループが選択されていません。");
      }
      return apiJson(
        hc.apiv1.group[":id"].profile.$post({
          param: { id: currentGroup.id },
          json: { name: changedGroupName },
        }),
        "グループの更新に失敗しました",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      raiseError("グループ情報を更新しました", "success");
    },
  });

  if (!currentGroup) {
    return <></>;
  }

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
          <button
            className="btn btn-primary"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "保存中" : "保存"}
          </button>
        </div>
      </div>
    </>
  );
};
export default GroupTopPage;
