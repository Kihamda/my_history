import { useAuthContext } from "@f/authContext";
import { raiseError } from "@f/errorHandler";
import { hc, type ResType } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";

type ScoutSummary = ResType<typeof hc.apiv1.user.sharedScouts.$get>[number];

const VisitorHome = () => {
  const { user } = useAuthContext();
  const [result, setResult] = useState<ScoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleFetchScouts = async (offset: number) => {
    setIsLoading(true);
    const response = await hc.apiv1.user.sharedScouts.$get({
      query: { offset: String(offset) },
    });

    if (response.ok) {
      setResult(await response.json());
    } else {
      raiseError(
        "スカウトの取得に失敗しました",
        "error",
        String(response.text),
      );
    }
    setIsLoading(false);
  };
  useEffect(() => {
    // 初回レンダリング時にデフォルトのスカウトを選択
    handleFetchScouts(0);
  }, []);

  return (
    <>
      <FullWidthCardHeader
        title={`ようこそ、${user.profile.displayName || "ゲスト"}さん`}
        memo="まずはスカウトを選択してください"
      />
      <Row>
        {result.map((scout) => (
          <Col key={scout.doc_id} md={4} className="mt-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{scout.personal.name}</h5>
                <p className="card-text">
                  {scout.personal.scoutId}
                  <br />
                  {scout.personal.currentUnitId}
                </p>
                <Link
                  to={`/app/scouts/${scout.doc_id}/view`}
                  className="btn btn-primary"
                >
                  このスカウトを選択
                </Link>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      {isLoading && (
        <LoadingSplash
          fullScreen={false}
          message="スカウトの情報を読み込み中..."
        />
      )}
    </>
  );
};

export default VisitorHome;
