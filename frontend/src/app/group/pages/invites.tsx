import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc, type ReqType } from "@f/lib/api/api";
import SearchUserWithMail from "@f/lib/popupContext/searchUserWithMailPopup";
import { usePopup } from "@f/lib/popupContext/fullscreanPopup";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useInfiniteQuery } from "@tanstack/react-query";

type InviteData = ReqType<
  (typeof hc.apiv1.group)[":id"]["invites"]["create"]["$post"]
>["json"];

type NewInviteData = {
  uid: InviteData["targetUid"];
  displayName: string;
  statusMessage: string;
  email: string;
  role: InviteData["role"];
};

const InvitesPage = () => {
  const [newData, setNewData] = useState<NewInviteData | null>(null);
  const { showPopup, hidePopup } = usePopup();

  const groupId = useAuthContext().currentGroup?.id;

  const invitesQuery = useInfiniteQuery({
    queryKey: ["group-invites", groupId],
    enabled: Boolean(groupId),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const result = await hc.apiv1.group[":id"].invites.$get({
        param: { id: groupId! },
        query: {
          offset: String(pageParam),
        },
      });

      if (!result.ok) {
        raiseError(
          "招待一覧の取得に失敗しました。",
          "error",
          (await result.json()).message,
        );
        return { invitees: [] };
      }

      return await result.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.invitees.length === 0) {
        return undefined;
      }

      return allPages.reduce((sum, page) => sum + page.invitees.length, 0);
    },
  });

  const results =
    invitesQuery.data?.pages.flatMap((page) => page.invitees) ?? [];

  const handleCreateInvite = async () => {
    if (!newData || !groupId) {
      if (!groupId) raiseError("グループが選択されていません。");
      return;
    }

    const result = await hc.apiv1.group[":id"].invites.create.$post({
      json: {
        targetUid: newData.uid,
        role: newData.role,
      },
      param: { id: groupId },
    });

    if (!result.ok) {
      raiseError("招待の作成に失敗しました。", "error", await result.text());
      return;
    }

    setNewData(null);
    raiseError("招待を作成しました。", "success");
  };

  return (
    <>
      <FullWidthCardHeader
        title="招待一覧"
        buttons={
          <>
            <Button
              onClick={() =>
                setNewData({
                  uid: "",
                  displayName: "",
                  statusMessage: "",
                  email: "",
                  role: "EDIT",
                })
              }
            >
              招待を追加
            </Button>
          </>
        }
      />

      {newData && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">新しい招待を作成</h5>
            <Row className="mt-3">
              <Col>
                {newData.uid.length === 0 ? (
                  <Button
                    onClick={() =>
                      showPopup({
                        content: (
                          <SearchUserWithMail
                            onSelect={(e) => {
                              setNewData({
                                ...newData,
                                uid: e.uid,
                                displayName: e.profile.displayName,
                                statusMessage: e.profile.statusMessage,
                                email: e.email,
                              });
                              hidePopup();
                            }}
                          />
                        ),
                      })
                    }
                  >
                    ユーザーを検索する
                  </Button>
                ) : (
                  <>
                    <h3 className="mb-0">{newData.displayName}</h3>

                    {newData.email}
                    <p className="mt-3">{newData.statusMessage}</p>
                  </>
                )}
              </Col>
              <Col>
                <select
                  value={newData.role}
                  className="form-select"
                  onChange={(e) =>
                    setNewData({
                      ...newData,
                      role: e.target.value as InviteData["role"],
                    })
                  }
                >
                  <option value="VIEW">閲覧者</option>
                  <option value="EDIT">編集者</option>
                  <option value="ADMIN">管理者</option>
                </select>
              </Col>
            </Row>
          </div>
          <div className="card-footer text-end">
            <Button variant="secondary" onClick={() => setNewData(null)}>
              招待作成をキャンセル
            </Button>
            <Button
              className="ms-2"
              disabled={newData.uid.length === 0}
              onClick={handleCreateInvite}
            >
              招待を作成
            </Button>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-body">
          <h3>招待一覧</h3>
          {invitesQuery.isPending ? (
            <p>招待一覧を読み込み中...</p>
          ) : results.length === 0 ? (
            <p>招待が存在しません。</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>表示名</th>
                  <th>メールアドレス</th>
                  <th>ステータスメッセージ</th>
                  <th>役割</th>
                </tr>
              </thead>
              <tbody>
                {results.map((invite, index) => (
                  <tr key={index}>
                    <td>{invite.displayName}</td>
                    <td>{invite.email}</td>
                    <td>{invite.statusMessage}</td>
                    <td>{invite.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card-footer text-end">
          <Button
            onClick={async () => {
              if (!invitesQuery.hasNextPage) {
                raiseError("これ以上招待はありません。", "info");
                return;
              }

              const nextData = await invitesQuery.fetchNextPage();
              if (nextData.data?.pages.at(-1)?.invitees.length === 0) {
                raiseError("これ以上招待はありません。", "info");
              }
            }}
            disabled={
              !groupId ||
              invitesQuery.isPending ||
              invitesQuery.isFetchingNextPage
            }
          >
            {invitesQuery.isFetchingNextPage
              ? "招待を読み込み中..."
              : "招待をもっと読み込む"}
          </Button>
        </div>
      </div>
    </>
  );
};
export default InvitesPage;
