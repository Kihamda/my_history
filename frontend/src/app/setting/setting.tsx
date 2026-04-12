import SidebarUI from "@f/lib/components/sidebar";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import MainPage from "./page/main";
import UserGroupsSettingsPage from "./page/groups";
import UserInvitesSettingsPage from "./page/invites";
import { useAuthContext } from "@f/authContext";

const Setting = () => {
  const currentUserData = useAuthContext().user.auth;

  return (
    <>
      <FullWidthCardHeader
        title="アカウントの設定"
        memo={"アカウントの設定を変更します"}
      />
      <SidebarUI
        pathBase="/app/setting"
        data={[
          {
            title: "プロフィール設定",
            path: "/",
            routeElement: <MainPage />,
          },
          {
            title: "所属中の組織" + `(${currentUserData.memberships.length})`,
            path: "/groups",
            routeElement: <UserGroupsSettingsPage />,
          },
          {
            title: "受けている招待" + `(${currentUserData.invites.length})`,
            path: "/invites",
            routeElement: <UserInvitesSettingsPage />,
          },
        ]}
      />
    </>
  );
};

export default Setting;
