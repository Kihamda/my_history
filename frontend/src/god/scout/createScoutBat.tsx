import { HEADER_LINE } from "@f/lib/csvScoutDataParser";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button } from "react-bootstrap";

const CreateScoutBatPage = () => {
  const [csvData, setCsvData] = useState<string>("");
  return (
    <>
      <FullWidthCardHeader
        title="スカウト一括登録"
        memo="CSVファイルからの一括登録を行います"
      />
      <div className="card mt-3">
        <div className="card-body">
          <h3>凡例</h3>
          <p>
            左から <code>{HEADER_LINE}</code>
          </p>
        </div>
        <div className="card-footer text-end">
          <Button variant="primary">送信</Button>
        </div>
      </div>
      <div className="mt-3">
        <textarea
          className="form-control"
          rows={300}
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="CSVファイルをここにコピペ"
        ></textarea>
      </div>
    </>
  );
};

export default CreateScoutBatPage;
