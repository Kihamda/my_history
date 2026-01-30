import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc, type ReqType } from "@f/lib/api/api";
import SearchUserWithMail from "@f/lib/components/searchUserWithMail";
import { usePopup } from "@f/lib/style/fullscreanPopup";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";

type InviteData = ReqType<
  (typeof hc.apiv1.group)[":id"]["invites"]["create"]["$post"]
>["json"];

type NewInviteData = {
  targetUid: InviteData["targetUid"];
  name: string;
  statusMessage: string;
  email: string;
  role: InviteData["role"];
};

const InvitesPage = () => {
  const [newData, setNewData] = useState<NewInviteData | null>(null);
  const { showPopup, hidePopup } = usePopup();

  const groupId = useAuthContext().user.currentGroup?.id;

  const handleCreateInvite = async () => {
    if (!newData) return;

    if (!groupId) {
      raiseError("グループが選択されていません。");
      return;
    }

    const result = await hc.apiv1.group[":id"].invites.create.$post({
      json: {
        targetUid: newData.targetUid,
        role: newData.role,
      },
      param: { id: groupId },
    });
    if (result.status === 201) {
      // 招待作成成功時の処理
      setNewData(null);
      raiseError("招待を作成しました。", "success");
      // 必要に応じて招待一覧を再取得するなどの処理を追加
    } else {
      // 招待作成失敗時の処理
      raiseError("招待の作成に失敗しました。", "error", await result.text());
    }
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
                  targetUid: "",
                  name: "",
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
                {newData.targetUid.length === 0 ? (
                  <Button
                    onClick={() =>
                      showPopup({
                        title: "ユーザーを検索",
                        content: (
                          <SearchUserWithMail
                            onSelect={(e) => {
                              setNewData({
                                ...newData,
                                targetUid: e.uid,
                                name: e.profile.displayName,
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
                    <h3 className="mb-0">{newData.name}</h3>

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
              disabled={newData.targetUid.length === 0}
              onClick={() => {
                handleCreateInvite();
              }}
            >
              招待を作成
            </Button>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-body">
          <p>招待一覧の内容をここに表示します。</p>
        </div>
      </div>
    </>
  );
};
export default InvitesPage;
