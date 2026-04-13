import { hc, type ResType } from "@f/lib/api/api";
import { useState } from "react";
import { raiseError } from "@f/errorHandler";
import { Button, Col, Row } from "react-bootstrap";
import InputGroupUI from "@f/lib/style/imputGroupUI";

type GroupDataType = {
  id: string;
  data: ResType<(typeof hc.apiv1.god.group)[":id"]["getGroupData"]["$get"]>;
};

const GodGroupPage = () => {
  const [results, setResults] = useState<GroupDataType[]>([]);
  const [editorSlot, setEditorSlot] = useState<GroupDataType | null>(null);
  const [openedTemp, setOpenedTemp] = useState("");
  const [inputId, setInputId] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // 検索処理
  const handleSearch = async () => {
    if (inputId.length === 0) {
      const data = await hc.apiv1.god.group.getAllGroups.$get({
        query: {
          page: page > 0 ? String(page) : "1",
        },
      });
      if (data.status !== 200) {
        raiseError("グループの検索に失敗しました。");
        setResults([]);
        return;
      }
      setResults(
        (await data.json()).map((item) => ({
          id: item.doc_id,
          data: item,
        })),
      );
      return;
    }

    const data = await hc.apiv1.god.group[":id"]["getGroupData"]["$get"]({
      param: {
        id: inputId.length > 0 ? inputId : undefined,
      },
    });
    if (data.status !== 200) {
      raiseError("グループの検索に失敗しました。");
      setResults([]);
      return;
    }
    setResults([{ data: await data.json(), id: inputId }]);
  };

  // 保存処理
  const handleSave = async (data: GroupDataType) => {
    if (!editorSlot) return;
    const result = await hc.apiv1.god.group[":id"]["setGroupData"]["$post"]({
      param: {
        id: data.id,
      },
      json: {
        userSettings: {
          name: data.data.userSettings.name,
        },
        adminTags: {
          description: data.data.adminTags.description,
        },
      },
    });
    if (result.status == 200) {
      raiseError("グループデータの保存に成功しました。", "success");
    } else {
      raiseError(
        "グループデータの保存に失敗しました。",
        "error",
        (await result.json()).message,
      );
    }
  };

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
              <Button onClick={handleSearch}>検索</Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() =>
                  setEditorSlot({
                    id: "placeholder",
                    data: {
                      userSettings: {
                        allowInvite: false,
                        allowShare: false,
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
                    handleSave(editorSlot);
                  }}
                >
                  保存
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
