import {
  apiJson,
  hc,
  queryClient,
  type ReqType,
  type ResType,
} from "@f/lib/api/api";
import { useState } from "react";
import { raiseError } from "@f/errorHandler";
import { Button } from "react-bootstrap";
import { JsonEditor } from "json-edit-react";
import UserSearchBox from "./userSearchBox";
import { useMutation, useQuery } from "@tanstack/react-query";

type UserDataType = ResType<typeof hc.apiv1.god.user.getUserData.$get>;
export type UserSearchType = Required<
  ReqType<typeof hc.apiv1.god.user.getUserData.$get>["query"]
>;

const GodUserPage = () => {
  const [submittedQuery, setSubmittedQuery] =
    useState<Partial<UserSearchType> | null>(null);
  const [editorSlot, setEditorSlot] = useState<UserDataType[number] | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const usersQuery = useQuery({
    queryKey: ["god-users", submittedQuery],
    enabled: submittedQuery !== null,
    queryFn: (): Promise<UserDataType> =>
      apiJson(
        hc.apiv1.god.user.getUserData.$get({
          query: submittedQuery || {},
        }),
        "ユーザーの検索に失敗しました。",
      ),
  });
  const results = usersQuery.data || [];
  const handleSearch = (query: UserSearchType) => {
    const sanitizedQuery = Object.fromEntries(
      Object.entries(query).map(([key, value]) => [
        key,
        typeof value === "string" && value.length === 0 ? undefined : value,
      ]),
    ) as Partial<UserSearchType>;
    setEditorSlot(null);
    setSubmittedQuery(sanitizedQuery);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editorSlot) throw new Error("ユーザーが選択されていません。");
      return apiJson(
        hc.apiv1.god.user[":id"].setUserData.$post({
          param: { id: editorSlot.doc_id },
          json: editorSlot,
        }),
        "ユーザーデータの保存に失敗しました。",
      );
    },
    onSuccess: async () => {
      raiseError("ユーザーデータの保存に成功しました。", "success");
      await queryClient.invalidateQueries({
        queryKey: ["god-users", submittedQuery],
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiJson(
        hc.apiv1.god.user[":id"].deleteUserData.$delete({
          param: { id },
        }),
        "ユーザーデータの削除に失敗しました。",
      );
    },
    onSuccess: async () => {
      raiseError("ユーザーデータの削除に成功しました。", "success");
      setEditorSlot(null);
      await queryClient.invalidateQueries({
        queryKey: ["god-users", submittedQuery],
      });
    },
  });

  return (
    <>
      <UserSearchBox handleSearchFunc={handleSearch} />
      <div className="mt-3">
        <div className="card">
          <div className="card-body">
            <h3>検索結果</h3>
            {results.length === 0 ? (
              <p>該当するユーザーが見つかりませんでした。</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ユニークID</th>
                    <th>表示名</th>
                    <th>メールアドレス</th>
                    <th>生年月日</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((user) => (
                    <tr key={user.doc_id}>
                      <td>{user.doc_id}</td>
                      <td>{user.profile.displayName}</td>
                      <td>{user.email}</td>
                      <td>{user.auth.isGod ? "神" : "凡人"}</td>
                      <td>
                        <Button
                          onClick={() => {
                            setEditorSlot(user);
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
                    setEditorSlot(value as UserDataType[number])
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

export default GodUserPage;
