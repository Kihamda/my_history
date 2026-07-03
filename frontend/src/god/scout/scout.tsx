import GodScoutSearchBox, { type ScoutSearchParams } from "./scoutSearchBox";
import {
  apiJson,
  hc,
  queryClient,
  type ResType,
} from "@f/lib/api/api";
import { useState } from "react";
import { raiseError } from "@f/errorHandler";
import { Button } from "react-bootstrap";
import { JsonEditor } from "json-edit-react";
import { useMutation, useQuery } from "@tanstack/react-query";

type ScoutDataType = ResType<typeof hc.apiv1.god.scout.getScoutData.$get>;

const GodScoutPage = () => {
  const [submittedQuery, setSubmittedQuery] =
    useState<ScoutSearchParams | null>(null);
  const [editorSlot, setEditorSlot] = useState<ScoutDataType[number] | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const scoutsQuery = useQuery({
    queryKey: ["god-scouts", submittedQuery],
    enabled: submittedQuery !== null,
    queryFn: async (): Promise<ScoutDataType> => {
      const query = submittedQuery!;
      return apiJson(
        hc.apiv1.god.scout.getScoutData.$get({
          query: {
            id: query.id || undefined,
            scoutId: query.scoutId || undefined,
            belongCurrentIds: query.belongCurrentIds || undefined,
            belongGroupId: query.belongGroupId || undefined,
          },
        }),
        "スカウトの検索に失敗しました。",
      );
    },
  });
  const results = scoutsQuery.data || [];
  const handleSearch = (query: ScoutSearchParams) => {
    setEditorSlot(null);
    setSubmittedQuery(query);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editorSlot) throw new Error("スカウトが選択されていません。");
      return apiJson(
        hc.apiv1.god.scout[":id"].setScoutData.$post({
          param: { id: editorSlot.doc_id },
          json: editorSlot,
        }),
        "スカウトデータの保存に失敗しました。",
      );
    },
    onSuccess: async () => {
      raiseError("スカウトデータの保存に成功しました。", "success");
      await queryClient.invalidateQueries({
        queryKey: ["god-scouts", submittedQuery],
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiJson(
        hc.apiv1.god.scout[":id"].deleteScoutData.$delete({
          param: { id },
        }),
        "スカウトデータの削除に失敗しました。",
      );
    },
    onSuccess: async () => {
      raiseError("スカウトデータの削除に成功しました。", "success");
      setEditorSlot(null);
      await queryClient.invalidateQueries({
        queryKey: ["god-scouts", submittedQuery],
      });
    },
  });

  return (
    <>
      <GodScoutSearchBox handleSearchFunc={handleSearch} />
      <div className="mt-3">
        <div className="card">
          <div className="card-body">
            <h3>検索結果</h3>
            {results.length === 0 ? (
              <p>該当するスカウトが見つかりませんでした。</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ユニークID</th>
                    <th>登録番号</th>
                    <th>氏名</th>
                    <th>生年月日</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((scout) => (
                    <tr key={scout.doc_id}>
                      <td>{scout.doc_id}</td>
                      <td>{scout.personal.scoutId}</td>
                      <td>{scout.personal.name}</td>
                      <td>{scout.personal.birthDate}</td>
                      <td>
                        <Button
                          onClick={() => {
                            setEditorSlot(scout);
                            setIsEditing(false);
                          }}
                        >
                          詳細を見る
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3">
        {editorSlot && (
          <div className="card">
            <div className="card-body">
              <div className="mb-3 d-flex justify-content-end align-items-center">
                <Button variant="secondary" onClick={() => setEditorSlot(null)}>
                  閉じる
                </Button>
                {isEditing ? (
                  <>
                    <Button
                      className="ms-2"
                      variant="success"
                      onClick={() => {
                        setEditorSlot(
                          results.find(
                            (e) => e.doc_id === editorSlot?.doc_id,
                          ) || null,
                        );
                        setIsEditing(false);
                      }}
                    >
                      保存せず戻る
                    </Button>
                    <Button
                      className="ms-2"
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(editorSlot.doc_id)}
                    >
                      削除
                    </Button>
                    <Button
                      className="ms-2"
                      variant="primary"
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate()}
                    >
                      保存
                    </Button>
                  </>
                ) : (
                  <Button
                    className="ms-2"
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    編集モード
                  </Button>
                )}
              </div>
              {isEditing ? (
                <JsonEditor
                  data={editorSlot}
                  maxWidth={"auto"}
                  setData={(value) =>
                    setEditorSlot(value as ScoutDataType[number])
                  }
                />
              ) : (
                <pre>{JSON.stringify(editorSlot, null, 2)}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GodScoutPage;
