import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { apiJson, hc, queryClient, type ResType } from "@f/lib/api/api";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import { PopupCard } from "@f/lib/popupContext/popupCard";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

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
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error("グループが選択されていません。");
      return apiJson(
        hc.apiv1.group[":id"].members[":uid"].role.$put({
          param: { id: groupId, uid: editor.uid },
          json: { role: editor.role },
        }),
        "メンバー情報の保存に失敗しました。",
      );
    },
    onSuccess: () => {
      raiseError("メンバー情報の保存に成功しました。", "success");
      setEditorSlot(editor);
      queryClient.invalidateQueries({
        queryKey: ["group-members", groupId],
      });
      hidePopup();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      if (!groupId) throw new Error("グループが選択されていません。");
      return apiJson(
        hc.apiv1.group[":id"].members[":uid"].$delete({
          param: { id: groupId, uid: docId },
        }),
        "メンバーの削除に失敗しました。",
      );
    },
    onSuccess: () => {
      raiseError("メンバーの削除に成功しました。", "success");
      setEditorSlot(null);
      queryClient.invalidateQueries({
        queryKey: ["group-members", groupId],
      });
      hidePopup();
    },
  });

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
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(editor.uid)}
          >
            メンバー削除
          </Button>
          <Button variant="secondary" onClick={hidePopup}>
            閉じる
          </Button>
          <Button
            variant="primary"
            className="ms-2"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "保存中" : "保存"}
          </Button>
        </div>
      }
    />
  );
};

const MembersPage = () => {
  const groupId = useAuthContext().currentGroup?.id;
  const { showPopup } = usePopup();
  const membersQuery = useInfiniteQuery({
    queryKey: ["group-members", groupId],
    enabled: !!groupId,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<MembersResponse> => {
      const data = await apiJson<{ members: MembersResponse }>(
        hc.apiv1.group[":id"].members.$get({
          param: { id: groupId! },
          query: { offset: String(pageParam) },
        }),
        "メンバー一覧の取得に失敗しました。",
      );
      return data.members;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 0 ? undefined : pages.flat().length,
  });
  const results = membersQuery.data?.pages.flat() || [];

  const handleDetail = (member: MembersResponse[number]) => {
    // 詳細表示の処理をここに実装
    showPopup({
      content: (
        <MemberEditor
          setEditorSlot={() => {
            queryClient.invalidateQueries({
              queryKey: ["group-members", groupId],
            });
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
          {membersQuery.isPending ? (
            <LoadingSplash fullScreen={false} />
          ) : results.length === 0 ? (
            <p>メンバーがいません。</p>
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
          <Button
            disabled={
              membersQuery.isFetchingNextPage ||
              !membersQuery.hasNextPage
            }
            onClick={() => membersQuery.fetchNextPage()}
          >
            {membersQuery.isFetchingNextPage
              ? "読み込み中"
              : membersQuery.hasNextPage
                ? "メンバーをもっと読み込む"
                : "これ以上ありません"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MembersPage;
