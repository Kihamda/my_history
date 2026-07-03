import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { apiJson, hc } from "@f/lib/api/api";
import { Button } from "react-bootstrap";
import { useMutation } from "@tanstack/react-query";

const UserGroupsSettingsPage = () => {
  const cont = useAuthContext();
  const groups = cont.user.auth.memberships || [];
  const leaveMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return apiJson(
        hc.apiv1.user.auth.leaveGroup[":groupId"].$post({
          param: { groupId },
        }),
        "グループの脱退に失敗しました。",
      );
    },
    onSuccess: async () => {
      await cont.refreshUser();
      raiseError("グループを脱退しました。", "success");
    },
  });

  const handleSelectGroup = (groupId: string) => {
    // グループ選択のロジック
    cont.setCurrentGroup(groupId);
  };

  const handleLeaveGroup = (groupId: string) => {
    if (
      confirm(
        "本当にグループを脱退しますか？\n脱退後、そのグループのデータにはアクセスできなくなります。",
      )
    ) {
      leaveMutation.mutate(groupId);
    }
  };

  return (
    <>
      {groups.length !== 0 && (
        <div className="row">
          {groups.map((group) => (
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
                    <Button onClick={() => handleSelectGroup(group.id)}>
                      選択する
                    </Button>
                    <Button
                      variant="danger"
                      className="ms-2"
                      disabled={leaveMutation.isPending}
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      {leaveMutation.isPending &&
                      leaveMutation.variables === group.id
                        ? "脱退中"
                        : "脱退"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UserGroupsSettingsPage;
