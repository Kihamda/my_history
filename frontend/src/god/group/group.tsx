import {
  apiJson,
  hc,
  queryClient,
  type ResType,
} from "@f/lib/api/api";
import { useState } from "react";
import { raiseError } from "@f/errorHandler";
import { Button, Col, Row } from "react-bootstrap";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useMutation, useQuery } from "@tanstack/react-query";

type GroupDataType = {
  id: string;
  data: ResType<(typeof hc.apiv1.god.group)[":id"]["getGroupData"]["$get"]>;
};

const GodGroupPage = () => {
  const [editorSlot, setEditorSlot] = useState<GroupDataType | null>(null);
  const [openedTemp, setOpenedTemp] = useState("");
  const [inputId, setInputId] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [submittedQuery, setSubmittedQuery] = useState<{
    inputId: string;
    page: number;
  } | null>(null);
  const groupsQuery = useQuery({
    queryKey: ["god-groups", submittedQuery],
    enabled: submittedQuery !== null,
    queryFn: async (): Promise<GroupDataType[]> => {
      const query = submittedQuery!;
      if (query.inputId.length === 0) {
        const groups = await apiJson<
          Array<GroupDataType["data"] & { doc_id: string }>
        >(
          hc.apiv1.god.group.getAllGroups.$get({
            query: { page: String(Math.max(query.page, 1)) },
          }),
          "グループの検索に失敗しました。",
        );
        return groups.map((item) => ({
          id: item.doc_id,
          data: item,
        }));
      }
      return [
        {
          data: await apiJson<GroupDataType["data"]>(
            hc.apiv1.god.group[":id"]["getGroupData"]["$get"]({
              param: { id: query.inputId },
            }),
            "グループの検索に失敗しました。",
          ),
          id: query.inputId,
        },
      ];
    },
  });
  const results = groupsQuery.data || [];
  const saveMutation = useMutation({
    mutationFn: async (data: GroupDataType) => {
      return apiJson(
        hc.apiv1.god.group[":id"]["setGroupData"]["$post"]({
          param: {
            id: data.id,
          },
          json: {
            userSettings: {
              ...data.data.userSettings
            },
            adminTags: {
              ...data.data.adminTags
            },
          },
        }),
        "グループデータの保存に失敗しました。",
      );
    },
    onSuccess: async () => {
      raiseError("グループデータの保存に成功しました。", "success");
      await queryClient.invalidateQueries({
        queryKey: ["god-groups", submittedQuery],
      });
    },
  });

  return (
    <>
      <Row>
        <Col sm={12} md={6}>
          <div className="card">
            <div className="card-body">
              <h3>グループ検索ボックス</h3>
              <div className="mb-3">
                <InputGroupUI
                  label="グループID"
                  value={inputId}
                  setValueFunc={(e) => setInputId(e)}
                />
                <InputGroupUI
                  label="ページ番号"
                  value={page}
                  type="number"
                  setValueFunc={(e) => setPage(e)}
                />
              </div>
            </div>
            <div className="card-footer text-end">
              <Button
                disabled={groupsQuery.isFetching}
                onClick={() => setSubmittedQuery({ inputId, page })}
              >
                {groupsQuery.isFetching ? "検索中" : "検索"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() =>
                  setEditorSlot({
                    id: "placeholder",
                    data: {
                      userSettings: {
                        allowSendScout: false,
                        allowShare: true,
                        name: "",
                      },
                      adminTags: {
                        description: "",
                      },
                    },
                  })
                }
              >
                新規作成
              </Button>
            </div>
          </div>
        </Col>
        <Col sm={12} md={6} className="mt-3 mt-md-0">
          {editorSlot ? (
            <div className="card">
              <div className="card-body">
                <h3>
                  {editorSlot.id !== openedTemp
                    ? "新規作成"
                    : editorSlot.data.userSettings.name + "の編集"}
                </h3>
                <InputGroupUI
                  label="ID"
                  value={editorSlot.id}
                  setValueFunc={(e) => setEditorSlot({ ...editorSlot, id: e })}
                />
                <InputGroupUI
                  label="名前"
                  value={editorSlot.data.userSettings.name}
                  setValueFunc={(e) =>
                    setEditorSlot({
                      ...editorSlot,
                      data: {
                        ...editorSlot.data,
                        userSettings: {
                          ...editorSlot.data.userSettings,
                          name: e,
                        },
                      },
                    })
                  }
                />
                <div className="mb-3">
                  <label className="form-label">memo</label>
                  <textarea
                    className="form-control"
                    value={editorSlot.data.adminTags.description}
                    onChange={(e) =>
                      setEditorSlot({
                        ...editorSlot,
                        data: {
                          ...editorSlot.data,
                          adminTags: {
                            ...editorSlot.data.adminTags,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="card-footer text-end">
                <Button
                  onClick={() => {
                    saveMutation.mutate(editorSlot);
                  }}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "保存中" : "保存"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <h3>グループ詳細表示</h3>
                <p>グループを選択してください。</p>
              </div>
            </div>
          )}
        </Col>
      </Row>
      <div className="mt-3">
        <div className="card">
          <div className="card-body">
            <h3>検索結果</h3>
            {results.length === 0 ? (
              <p>該当するグループが見つかりませんでした。</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>グループID</th>
                    <th>名前</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((group) => (
                    <tr key={group.id}>
                      <td>{group.id}</td>
                      <td>{group.data.userSettings.name}</td>
                      <td>
                        <Button
                          onClick={() => {
                            setEditorSlot(group);
                            setOpenedTemp(group.id);
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
    </>
  );
};

export default GodGroupPage;
