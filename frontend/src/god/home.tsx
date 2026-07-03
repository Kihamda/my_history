import { apiJson, hc, type ResType } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { faChartArea } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";

type ServerInfo = ResType<typeof hc.apiv1.god.$get>;

const GodHome = () => {
  const serverInfoQuery = useQuery({
    queryKey: ["god-info"],
    queryFn: (): Promise<ServerInfo> =>
      apiJson(hc.apiv1.god.$get(), "管理者情報の取得に失敗しました。"),
  });
  const serverInfo = serverInfoQuery.data || {
    isDev: false,
    message: serverInfoQuery.isPending
      ? "確認中です"
      : "管理者情報の取得に失敗しました",
  };

  return (
    <>
      <FullWidthCardHeader
        title="管理者ホーム"
        memo="アプリケーションの情報をすべて管理できます。"
        buttons={
          <a
            href="https://analytics.google.com/analytics/web/#/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faChartArea} className="me-1" />
            Google Analyticsを見る
          </a>
        }
      />
      <div className="mt-3 text-center fs-3">
        {serverInfo.isDev ? (
          "開発環境です"
        ) : (
          <span className="text-danger">本番環境です</span>
        )}
      </div>
      <div className="mt-3 d-flex justify-content-center">
        <img
          src="/spaAssets/god/i-guess-youre-trying-hacking-myapp-stop-it;).png"
          className="w-50"
          alt="なにしてるの？:)"
        />
      </div>
      <div className="mt-3 text-center fs-3">{serverInfo.message}</div>
    </>
  );
};
export default GodHome;
