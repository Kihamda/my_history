import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { apiJson, hc } from "@f/lib/api/api";
import { Button } from "react-bootstrap";
import { useMutation } from "@tanstack/react-query";

const UserInvitesSettingsPage = () => {
  const cont = useAuthContext();
  const invites = cont.user.auth.invites || [];
  const acceptMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return apiJson(
        hc.apiv1.user.auth.acceptInvite[":groupCode"].$post({
          param: { groupCode: groupId },
        }),
        "グループへの参加に失敗しました。",
      );
    },
    onSuccess: async () => {
      await cont.refreshUser();
      raiseError("グループに参加しました。", "success");
    },
  });
  const denyMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return apiJson(
        hc.apiv1.user.auth.denyInvite[":groupCode"].$post({
          param: { groupCode: groupId },
        }),
        "招待の拒否に失敗しました。",
      );
    },
    onSuccess: async () => {
      await cont.refreshUser();
      raiseError("招待を拒否しました。", "success");
    },
  });

  const handleJoinGroup = (groupId: string) => {
    if (confirm("本当にグループに参加しますか？")) {
      acceptMutation.mutate(groupId);
    }
  };

  const handleDenyInvites = (groupId: string) => {
    if (
      confirm(
        "本当にグループの招待を拒否しますか？\n拒否後、そのグループの招待は取り消されます。",
      )
    ) {
      denyMutation.mutate(groupId);
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
                    <Button
                      disabled={
                        acceptMutation.isPending || denyMutation.isPending
                      }
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {acceptMutation.isPending &&
                      acceptMutation.variables === group.id
                        ? "参加中"
                        : "参加する"}
                    </Button>
                    <Button
                      variant="danger"
                      className="ms-2"
                      disabled={
                        acceptMutation.isPending || denyMutation.isPending
                      }
                      onClick={() => handleDenyInvites(group.id)}
                    >
                      {denyMutation.isPending &&
                      denyMutation.variables === group.id
                        ? "拒否中"
                        : "拒否"}
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
