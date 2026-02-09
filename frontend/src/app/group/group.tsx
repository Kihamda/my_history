import { useAuthContext } from "@f/authContext";
import SidebarUI from "@f/lib/components/sidebar";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { lazy, Suspense } from "react";
const GroupTopPage = lazy(() => import("./pages/top"));
const MembersPage = lazy(() => import("./pages/members"));
const InvitesPage = lazy(() => import("./pages/invites"));

const GroupPage = () => {
  if (useAuthContext().currentGroup == null) {
    return (
      <div className="text-center mt-3">
        所属グループが設定されていないため、グループ設定ページは表示できません。
      </div>
    );
  }
  return (
    <>
      <SidebarUI
        pathBase="/app/group"
        data={[
          {
            title: "グループ設定トップ",
            path: "/",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <GroupTopPage />
              </Suspense>
            ),
          },
          {
            title: "メンバー管理",
            path: "/members",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <MembersPage />
              </Suspense>
            ),
          },
          {
            title: "招待管理",
            path: "/invites",
            routeElement: (
              <Suspense fallback={<LoadingSplash />}>
                <InvitesPage />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
};

export default GroupPage;
