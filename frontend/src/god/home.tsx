import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { faChartArea } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row } from "react-bootstrap";

const GodHome = () => {
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
      <Row></Row>
    </>
  );
};
export default GodHome;
