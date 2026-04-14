import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import type { ScoutData } from "@f/lib/api/apiTypes";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button } from "react-bootstrap";

const ScoutTransfarPopup = ({ data, id }: { data: ScoutData; id: string }) => {
  const [sendID, setSendID] = useState("");
  const [targetGroup, setTargetGroup] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSearchGroup = async () => {
    // ここで団体IDの存在確認を行う
    try {
      const response = await hc.apiv1.group[":id"].profile.$get({
        param: { id: sendID },
      });
      if (response.status === 200) {
        // 団体IDが存在する場合の処理
        // 例えば、移管処理を実行するAPIを呼び出すなど
        setTargetGroup({
          id: sendID,
          name: (await response.json()).name,
        });
      } else {
        raiseError("指定された団体IDは存在しません。");
      }
    } catch (error) {
      raiseError("団体IDの確認に失敗しました。");
    }
  };

  const handleTransfer = async (scoutID: string, targetGroupID: string) => {
    try {
      const response = await hc.apiv1.scout[":id"].transfer.$post({
        param: { id: scoutID },
        json: { targetGroupId: targetGroupID },
      });
      if (response.status === 200) {
        raiseError("データの移管が完了しました。", "success");
      }
    } catch (error) {
      raiseError("データの移管に失敗しました。");
    }
  };

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
          <Button variant="primary" onClick={handleSearchGroup}>
            移管先を検索
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
                onClick={() => {
                  if (
                    confirm(
                      `本当に${data.personal.name}さんのデータを${targetGroup.name}に移管しますか？この操作は取り消せません。`,
                    )
                  ) {
                    // ここで移管処理を実行するAPIを呼び出すなど
                    handleTransfer(id, targetGroup.id);
                  }
                }}
              >
                データを移管する
              </Button>
            </div>
          </div>
        )}
      </div>
    </PopupCard>
  );
};

export default ScoutTransfarPopup;
