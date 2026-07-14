import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import {
  apiJson,
  hc,
  queryClient,
  type ResType,
} from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useMutation, useQuery } from "@tanstack/react-query";

type GroupSettings = ResType<
  (typeof hc.apiv1.group)[":id"]["profile"]["$get"]
>;

const GroupTopPage = () => {
  const { currentGroup } = useAuthContext();
  const groupId = currentGroup?.id;
  const isAdmin = currentGroup?.role === "ADMIN";
  const [draft, setDraft] = useState<{
    groupId: string;
    settings: GroupSettings;
  } | null>(null);

  const groupQuery = useQuery({
    queryKey: ["group-settings", groupId],
    enabled: !!groupId,
    queryFn: () =>
      apiJson<GroupSettings>(
        hc.apiv1.group[":id"].profile.$get({
          param: { id: groupId! },
        }),
        "グループ情報の取得に失敗しました。",
      ),
  });

  const settings =
    draft && draft.groupId === groupId ? draft.settings : groupQuery.data;
  const isDirty =
    !!settings &&
    !!groupQuery.data &&
    (settings.name !== groupQuery.data.name ||
      settings.allowShare !== groupQuery.data.allowShare ||
      settings.allowSendScout !== groupQuery.data.allowSendScout);

  const updateDraft = (changedSettings: Partial<GroupSettings>) => {
    if (!groupId || !settings) return;
    setDraft({
      groupId,
      settings: { ...settings, ...changedSettings },
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (nextSettings: GroupSettings) => {
      if (!groupId) throw new Error("グループが選択されていません。");
      return apiJson(
        hc.apiv1.group[":id"].profile.$post({
          param: { id: groupId },
          json: nextSettings,
        }),
        "グループの更新に失敗しました。",
      );
    },
    onSuccess: async () => {
      setDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["group-settings", groupId],
        }),
        queryClient.invalidateQueries({ queryKey: ["current-user"] }),
      ]);
      raiseError("グループ情報を更新しました。", "success");
    },
  });

  if (!currentGroup) return <></>;

  return (
    <>
      <FullWidthCardHeader title="グループ設定" />
      <div className="mt-3 card">
        <div className="card-body">
          {groupQuery.isPending ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" />
            </div>
          ) : !settings ? (
            <div className="text-center py-3">
              <Button
                variant="outline-secondary"
                onClick={() => groupQuery.refetch()}
              >
                再読み込み
              </Button>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="groupName" className="mb-3">
                <Form.Label>グループ名</Form.Label>
                <Form.Control
                  value={settings.name}
                  maxLength={100}
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateDraft({ name: event.target.value })
                  }
                />
              </Form.Group>
              <Form.Check
                type="switch"
                id="allowShare"
                className="mb-3"
                label="新規共有の作成を許可する"
                checked={settings.allowShare}
                disabled={!isAdmin}
                onChange={(event) =>
                  updateDraft({ allowShare: event.target.checked })
                }
              />
              <Form.Check
                type="switch"
                id="allowSendScout"
                label="他のグループからのデータ移管を受け付ける"
                checked={settings.allowSendScout}
                disabled={!isAdmin}
                onChange={(event) =>
                  updateDraft({ allowSendScout: event.target.checked })
                }
              />
            </Form>
          )}
        </div>
        {isAdmin && settings && (
          <div className="card-footer text-end">
            <Button
              disabled={
                saveMutation.isPending || !isDirty || settings.name.trim() === ""
              }
              onClick={() => saveMutation.mutate(settings)}
            >
              {saveMutation.isPending ? "保存中" : "保存"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupTopPage;
