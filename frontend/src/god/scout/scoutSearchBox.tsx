import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";

export interface ScoutSearchParams {
  id: string;
  scoutId: string;
}

const GodScoutSearchBox = ({
  handleSearchFunc,
}: {
  handleSearchFunc: (query: ScoutSearchParams) => void;
}) => {
  const [tmpSearchParams, setTmpSearchParams] = useState<ScoutSearchParams>({
    id: "",
    scoutId: "",
  });

  // 検索ボタンハンドラ
  const handleSearch = () => {
    handleSearchFunc(tmpSearchParams);
  };

  //本体
  return (
    <div className="card">
      <div className="card-body">
        <h3>スカウト検索ボックス</h3>
        <Row className="mt-3 ">
          <Col sm={12} md={6}>
            <InputGroupUI
              label="ユニークID"
              value={tmpSearchParams.id}
              setValueFunc={(e) =>
                setTmpSearchParams({ ...tmpSearchParams, id: e })
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <InputGroupUI
              label="登録番号"
              value={tmpSearchParams.scoutId}
              setValueFunc={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  scoutId: e,
                })
              }
            />
          </Col>
        </Row>
      </div>
      <div className="card-footer text-end">
        <Button onClick={handleSearch}>検索</Button>
      </div>
    </div>
  );
};

export default GodScoutSearchBox;
