import type { hc, ReqType } from "@f/lib/api/api";
import type { ScoutDataUnitIdListType } from "@f/lib/clientCommons/scout";
import UnitSelector from "@f/lib/components/unitSelector";
import InputGroupUI from "@f/lib/style/imputGroupUI";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";

export type ScoutSearchParams = Required<
  ReqType<typeof hc.apiv1.god.scout.getScoutData.$get>["query"]
>;

const GodScoutSearchBox = ({
  handleSearchFunc,
}: {
  handleSearchFunc: (query: ScoutSearchParams) => void;
}) => {
  const [tmpSearchParams, setTmpSearchParams] = useState<ScoutSearchParams>({
    id: "",
    scoutId: "",
    belongCurrentIds: "",
    belongGroupId: "",
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
        <Row>
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
          <Col sm={12} md={6}>
            <InputGroupUI
              label="所属グループID"
              value={tmpSearchParams.belongGroupId}
              setValueFunc={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  belongGroupId: e,
                })
              }
            />
          </Col>
          <Col sm={12} md={6}>
            <UnitSelector
              units={
                tmpSearchParams.belongCurrentIds.split(
                  ","
                ) as ScoutDataUnitIdListType[]
              }
              onChange={(e) =>
                setTmpSearchParams({
                  ...tmpSearchParams,
                  belongCurrentIds: e.join(","),
                })
              }
              id="dd"
            />
          </Col>
        </Row>
      </div>
      <div className="card-footer text-end">
        <Button className="ms-2" onClick={handleSearch}>
          検索
        </Button>
      </div>
    </div>
  );
};

export default GodScoutSearchBox;
