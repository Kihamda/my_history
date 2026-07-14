import { useAuthContext } from "@f/authContext";
import { apiJson, hc, type ResType } from "@f/lib/api/api";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";

type ScoutSummary = ResType<typeof hc.apiv1.user.sharedScouts.$get>[number];

const VisitorHome = () => {
  const { user } = useAuthContext();
  const sharedScoutsQuery = useQuery({
    queryKey: ["shared-scouts"],
    queryFn: (): Promise<ScoutSummary[]> =>
      apiJson(
        hc.apiv1.user.sharedScouts.$get({
        query: { offset: "0" },
        }),
        "スカウトの取得に失敗しました",
      ),
  });

  const result = sharedScoutsQuery.data || [];

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
      {sharedScoutsQuery.isPending && (
        <LoadingSplash
          fullScreen={false}
          message="スカウトの情報を読み込み中..."
        />
      )}
    </>
  );
};

export default VisitorHome;
