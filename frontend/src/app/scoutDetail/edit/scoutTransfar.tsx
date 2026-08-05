import { raiseError } from "@f/errorHandler";
import { apiJson, hc } from "@f/lib/api/api";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useMutation, useQuery } from "@tanstack/react-query";

const ScoutTransfarPopup = ({ data, id }: { data: ScoutData; id: string }) => {
  const [sendID, setSendID] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const groupQuery = useQuery({
    queryKey: ["group-profile", submittedId],
    enabled: submittedId.length > 0,
    queryFn: async (): Promise<{ id: string; name: string }> => {
      const group = await apiJson<{ name: string }>(
        hc.apiv1.group[":id"].profile.$get({
          param: { id: submittedId },
        }),
        "指定された団体IDは存在しません。",
      );
      return { id: submittedId, name: group.name };
    },
  });
  const transferMutation = useMutation({
    mutationFn: (targetGroupID: string) =>
      apiJson(
        hc.apiv1.scout[":id"].transfer.$post({
          param: { id },
          json: { targetGroupId: targetGroupID },
        }),
        "データの移管に失敗しました。",
      ),
    onSuccess: () => raiseError("データの移管が完了しました。", "success"),
  });
  const targetGroup = groupQuery.data;

  return (
    <PopupCard title="スカウトデータの移管">
      <div>
        <h3>{data.personal.name}さんのデータ移管</h3>
        <p>
          {data.personal.name}
          さんのデータを他の団体に移管します。移管したデータは復元できません。
        </p>
        <InputGroupUI
          label="移管先の団体ID"
          placeholder="移管先の団体IDを入力してください"
          value={sendID}
          setValueFunc={(value) => {
            setSendID(value);
          }}
        />
        <div className="text-end">
          <Button
            variant="primary"
            disabled={!sendID || groupQuery.isFetching}
            onClick={() => setSubmittedId(sendID)}
          >
            {groupQuery.isFetching ? "検索中" : "移管先を検索"}
          </Button>
        </div>
        {targetGroup && (
          <div className="mt-3">
            <h2>移管先の団体情報</h2>
            <p>団体ID: {targetGroup.id}</p>
            <p>団体名: {targetGroup.name}</p>
            <div className="text-end">
              <Button
                variant="danger"
                disabled={transferMutation.isPending}
                onClick={() => {
                  if (
                    confirm(
                      `本当に${data.personal.name}さんのデータを${targetGroup.name}に移管しますか？この操作は取り消せません。`,
                    )
                  ) {
                    // ここで移管処理を実行するAPIを呼び出すなど
                    transferMutation.mutate(targetGroup.id);
                  }
                }}
              >
                {transferMutation.isPending ? "移管中" : "データを移管する"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PopupCard>
  );
};

export default ScoutTransfarPopup;
