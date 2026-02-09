import SidebarUI from "@f/lib/components/sidebar";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import MainPage from "./page/main";
import UserGroupsSettingsPage from "./page/groups";
import UserInvitesSettingsPage from "./page/invites";

const Setting = () => {
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
            title: "基本設定",
            path: "/",
            routeElement: <MainPage />,
            index: [
              {
                key: "profile",
                label: "プロフィール設定",
              },
              {
                key: "privacy",
                label: "プライバシー設定",
              },
            ],
          },
          {
            title: "所属中の組織",
            path: "/groups",
            routeElement: <UserGroupsSettingsPage />,
          },
          {
            title: "受けている招待",
            path: "/invites",
            routeElement: <UserInvitesSettingsPage />,
          },
        ]}
      />
    </>
  );
};

export default Setting;
