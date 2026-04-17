import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc, type ResType } from "@f/lib/api/api";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";

type MembersResponse = ResType<
  (typeof hc.apiv1.group)[":id"]["members"]["$get"]
>["members"];

const MemberEditor = ({
  editorSlot,
  setEditorSlot,
  groupId,
}: {
  editorSlot: MembersResponse[number];
  setEditorSlot: (editorSlot: MembersResponse[number] | null) => void;
  groupId?: string;
}) => {
  const { hidePopup } = usePopup();
  const [editor, setEditor] = useState<MembersResponse[number]>(editorSlot);

  const handleSave = async () => {
    if (!groupId) return;
    const result = await hc.apiv1.group[":id"].members[":uid"].role.$put({
      param: { id: groupId, uid: editor.uid },
      json: {
        role: editor.role,
      },
    });
    if (result.status === 200) {
      raiseError("メンバー情報の保存に成功しました。", "success");
      setEditorSlot(editor);
      hidePopup();
    } else {
      raiseError(
        "メンバー情報の保存に失敗しました。",
        "error",
        (await result.json()).message,
      );
    }
  };

  const handleDelete = async (docId: string) => {
    if (!groupId) {
      raiseError("グループが選択されていません。");
      return;
    }
    const result = await hc.apiv1.group[":id"].members[":uid"].$delete({
      param: { id: groupId, uid: docId },
    });
    if (result.status === 200) {
      raiseError("メンバーの削除に成功しました。", "success");
      setEditorSlot(null);
      hidePopup();
    } else {
      raiseError(
        "メンバーの削除に失敗しました。",
        "error",
        (await result.json()).message,
      );
    }
  };

  return (
    <PopupCard
      title="メンバー編集"
      children={
        <>
          <h5>{editor.displayName}</h5>
          <select
            value={editor.role}
            className="form-select"
            onChange={(event) => {
              setEditor({
                ...editor,
                role: (event.target as HTMLSelectElement)
                  .value as MembersResponse[number]["role"],
              });
            }}
          >
            <option value="ADMIN">管理者：グループの設定を管理可能</option>
            <option value="EDIT">編集者：編集のみ可能</option>
            <option value="VIEW">閲覧者：閲覧のみ可能</option>
          </select>
        </>
      }
      footer={
        <div className="text-end">
          <Button
            variant="danger"
            className="me-2"
            onClick={() => handleDelete(editor.uid)}
          >
            メンバー削除
          </Button>
          <Button variant="secondary" onClick={hidePopup}>
            閉じる
          </Button>
          <Button variant="primary" className="ms-2" onClick={handleSave}>
            保存
          </Button>
        </div>
      }
    />
  );
};

const MembersPage = () => {
  const [results, setResults] = useState<MembersResponse>([]);
  const groupId = useAuthContext().currentGroup?.id;

  const { showPopup } = usePopup();

  const handleGetMembers = useCallback(
    async (offset?: number) => {
      if (!groupId) {
        raiseError("グループが選択されていません。");
        return;
      }

      try {
        const result = await hc.apiv1.group[":id"].members.$get({
          param: { id: groupId },
          query: {
            offset: String(offset ?? 0),
          },
        });

        if (result.status === 200) {
          const data = (await result.json()).members;
          if (offset === undefined) {
            setResults(data);
          } else {
            if (data.length === 0) {
              raiseError("これ以上メンバーはいません。", "info");
              return;
            }
            setResults((prev) => [...prev, ...data]);
          }
        } else {
          raiseError(
            "メンバー一覧の取得に失敗しました。",
            "error",
            (await result.json()).message,
          );
        }
      } catch (error) {
        raiseError(
          "メンバー一覧の取得中にエラーが発生しました。",
          "error",
          String(error),
        );
      }
    },
    [groupId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleGetMembers();
  }, [handleGetMembers]);

  const handleDetail = (member: MembersResponse[number]) => {
    // 詳細表示の処理をここに実装
    showPopup({
      content: (
        <MemberEditor
          setEditorSlot={(data) => {
            if (data === null) {
              setResults((prev) => prev.filter((m) => m.uid !== member.uid));
            } else {
              setResults((prev) =>
                prev.map((m) => (m.uid === data.uid ? data : m)),
              );
            }
          }}
          editorSlot={member}
          groupId={groupId}
        />
      ),
    });
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h3>メンバ一覧</h3>
          {!results.length ? (
            <LoadingSplash fullScreen={false} />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>表示名</th>
                  <th>メールアドレス</th>
                  <th>ステータスメッセージ</th>
                  <th>役割</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {results.map((member, index) => (
                  <tr key={index}>
                    <td>{member.displayName}</td>
                    <td>{member.email}</td>
                    <td>{member.statusMessage}</td>
                    <td>
                      {member.role == "ADMIN"
                        ? "管理者"
                        : member.role == "EDIT"
                          ? "編集者"
                          : "閲覧者"}
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleDetail(member)}
                      >
                        詳細
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card-footer text-end">
          <Button onClick={() => handleGetMembers(results.length)}>
            メンバーをもっと読み込む
          </Button>
        </div>
      </div>
    </>
  );
};

export default MembersPage;
