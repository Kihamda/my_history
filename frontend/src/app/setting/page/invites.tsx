import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import { Button } from "react-bootstrap";

const UserInvitesSettingsPage = () => {
  const cont = useAuthContext();
  const invites = cont.user.auth.invites || [];

  const handleJoinGroup = async (groupId: string) => {
    // グループ選択のロジック
    if (confirm("本当にグループに参加しますか？")) {
      const result = await hc.apiv1.user.auth.acceptInvite[":groupCode"].$post({
        param: { groupCode: groupId },
      });
      raiseError(
        "グループに参加しました。",
        "success",
        (await result.json()).message,
      );
    }
  };

  const handleDenyInvites = async (groupId: string) => {
    // 招待拒否のロジックをここに実装
    if (
      confirm(
        "本当にグループの招待を拒否しますか？\n拒否後、そのグループの招待は取り消されます。",
      )
    ) {
      const result = await hc.apiv1.user.auth.leaveGroup[":groupId"].$post({
        param: { groupId },
      });

      if (result.status !== 200) {
        raiseError(
          "グループの脱退に失敗しました。",
          "error",
          (await result.json()).message,
        );
        return;
      }

      raiseError(
        "グループを脱退しました。",
        "success",
        `Left Group ID: ${groupId}`,
      );
    }
  };

  return (
    <>
      {invites.length !== 0 ? (
        <div className="row">
          {invites.map((group) => (
            <div className="col-12 col-md-6" key={group.id}>
              <div className="card mb-3">
                <div className="card-body">
                  <h4 className="card-title mb-1">{group.name}</h4>
                  <p className="card-text">
                    {group.role == "ADMIN"
                      ? "管理者"
                      : group.role == "EDIT"
                        ? "編集者"
                        : "閲覧者"}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <small className="text-muted">ID: {group.id}</small>
                  <div>
                    <Button onClick={() => handleJoinGroup(group.id)}>
                      参加する
                    </Button>
                    <Button
                      variant="danger"
                      className="ms-2"
                      onClick={() => handleDenyInvites(group.id)}
                    >
                      拒否
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>招待はありません。</p>
      )}
    </>
  );
};

export default UserInvitesSettingsPage;
