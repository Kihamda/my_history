import SidebarUI from "@f/lib/components/sidebar";
import FullWidthCardHeader from "@f/style/fullWidthCardHeader";
import MainPage from "./page/main";

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
            title: "通知設定",
            path: "/notifications",
            routeElement: <div>通知設定ページ</div>,
            index: [],
          },
        ]}
      />
    </>
  );
};

export default Setting;
