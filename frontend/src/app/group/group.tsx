import SidebarUI from "@f/lib/components/sidebar";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { lazy, Suspense } from "react";
const GroupTopPage = lazy(() => import("./pages/top"));
const MembersPage = lazy(() => import("./pages/members"));
const InvitesPage = lazy(() => import("./pages/invites"));

const GroupPage = () => {
  return (
    <>
      <SidebarUI
        pathBase="/app/group"
        hideIndex={true}
        data={[
          {
            title: "グループ設定トップ",
            path: "/",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <GroupTopPage />
              </Suspense>
            ),
            index: [],
          },
          {
            title: "メンバー管理",
            path: "/members",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <MembersPage />
              </Suspense>
            ),
            index: [],
          },
          {
            title: "招待管理",
            path: "/invites",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <InvitesPage />
              </Suspense>
            ),
            index: [],
          },
        ]}
      />
    </>
  );
};

export default GroupPage;
