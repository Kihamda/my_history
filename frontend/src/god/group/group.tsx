import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { hc, type ResType } from "@f/lib/api/api";
import { useState } from "react";
import { raiseError } from "@f/errorHandler";
import { Button } from "react-bootstrap";
import { JsonEditor } from "json-edit-react";
import InputGroupUI from "@f/lib/style/imputGroupUI";

type GroupDataType = ResType<
  (typeof hc.apiv1.god.group)[":id"]["getGroupData"]["$get"]
> & { id: string };

const GodGroupPage = () => {
  const [results, setResults] = useState<GroupDataType | null>(null);
  const [editorSlot, setEditorSlot] = useState<GroupDataType | null>(null);
  const [inputId, setInputId] = useState<string>("");

  // 検索処理
  const handleSearch = async () => {
    if (!inputId || inputId.length === 0) {
      raiseError("グループIDを指定してください。");
      setResults(null);
      return;
    }
    const data = await hc.apiv1.god.group[":id"]["getGroupData"]["$get"]({
      param: {
        id: inputId.length > 0 ? inputId : undefined,
      },
    });
    if (data.status !== 200) {
      raiseError("グループの検索に失敗しました。");
      setResults(null);
      return;
    }
    setResults({ ...(await data.json()), id: inputId });
  };

  const handleSave = async () => {
    if (!editorSlot) return;
    const result = await hc.apiv1.god.group[":id"]["setGroupData"]["$post"]({
      param: {
        id: inputId,
      },
      json: editorSlot,
    });
    if (result.status == 200) {
      raiseError("グループデータの保存に成功しました。", "success");
    } else {
      raiseError(
        "グループデータの保存に失敗しました。",
        "error",
        await result.text()
      );
    }
  };

  return (
    <>
      <FullWidthCardHeader
        title="グループ管理"
        memo="グループの情報を管理します。"
      />
      <div className="mt-3">
        <div className="card">
          <div className="card-body">
            <h3>グループ検索ボックス</h3>
            <div className="mb-3">
              <InputGroupUI
                label="グループID"
                value={inputId}
                setValueFunc={(e) => setInputId(e)}
              />
            </div>
          </div>
          <div className="card-footer text-end">
            <Button onClick={handleSearch}>検索</Button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        {results && (
          <div className="card">
            <div className="card-body">
              <div className="mb-3 d-flex justify-content-end align-items-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditorSlot(null);
                    setResults(null);
                  }}
                >
                  閉じる
                </Button>
                {editorSlot ? (
                  <>
                    <Button
                      className="ms-2"
                      variant="success"
                      onClick={() => {
                        setEditorSlot(null);
                      }}
                    >
                      保存せず戻る
                    </Button>
                    <Button
                      className="ms-2"
                      variant="primary"
                      onClick={() => handleSave()}
                    >
                      保存
                    </Button>
                  </>
                ) : (
                  <Button
                    className="ms-2"
                    variant="primary"
                    onClick={() => setEditorSlot(results)}
                  >
                    編集モード
                  </Button>
                )}
              </div>
              {editorSlot ? (
                <JsonEditor
                  data={editorSlot}
                  maxWidth={"auto"}
                  setData={(value) => setEditorSlot(value as GroupDataType)}
                />
              ) : (
                <pre>{JSON.stringify(results, null, 2)}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GodGroupPage;
