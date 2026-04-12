import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import csvScoutDataParser, {
  HEADER_LINE,
  type CsvScoutRecord,
} from "@f/lib/csvScoutDataParser";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button } from "react-bootstrap";

const CreateScoutBatPage = () => {
  const [csvData, setCsvData] = useState<string>("");
  const [csvParsedData, setCsvParsedData] = useState<CsvScoutRecord[] | null>(
    null,
  );
  const handleParse = () => {
    // CSVデータをパースしてAPIに送信する処理をここに実装
    const data = csvScoutDataParser(csvData).parsedData;
    setCsvParsedData(data);
    console.log(data);
    // 例: APIに送信する場合
  };

  const handleSubmit = async () => {
    if (!csvParsedData) return;

    try {
      const result = await hc.apiv1.god.scout.batchSetScoutData.$post({
        json: [
          ...csvParsedData.map((record) => ({
            id: record.id.length > 0 ? record.id : undefined,
            data: {
              ...record,
            },
          })),
        ],
      });

      if (result.status === 200) {
        raiseError("スカウトデータの一括登録に成功しました", "success");
      } else {
        raiseError(
          "スカウトデータの一括登録に失敗しました",
          "error",
          (await result.json()).message,
        );
      }
    } catch (error) {
      raiseError("スカウトデータの一括登録に失敗しました", "error");
    }
  };

  return (
    <>
      <FullWidthCardHeader
        title="スカウト一括登録"
        memo="CSVファイルからの一括登録を行います"
      />
      {csvParsedData ? (
        <div className="card mt-3">
          <div className="card-header">
            パースされたデータ: {csvParsedData.length} 件
          </div>
          <div className="card-body">
            {csvParsedData.map((record, index) => (
              <div key={index + record.id} className="mb-2">
                <strong>ID:</strong> {record.id || "N/A"} |
                <strong>Name:</strong> {record.personal.name} |
                <strong>Scout ID:</strong> {record.personal.scoutId} |
                <strong>Belong Group ID:</strong> {record.belongGroupId} |
                <strong>Belong Current Unit ID:</strong>
                {record.personal.currentUnitId}
              </div>
            ))}
          </div>

          <div className="card-footer text-end">
            <Button variant="success" onClick={handleSubmit}>
              APIに送信
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="card mt-3">
            <div className="card-body">
              <h3>凡例</h3>
              <p>
                左から <code>{HEADER_LINE}</code>
              </p>
            </div>
            <div className="card-footer text-end">
              <Button variant="primary" onClick={handleParse}>
                送信
              </Button>
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
      )}
    </>
  );
};

export default CreateScoutBatPage;
