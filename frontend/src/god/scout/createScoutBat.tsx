import { raiseError } from "@f/errorHandler";
import { hc } from "@f/lib/api/api";
import csvScoutDataParser, {
  HEADER_LINE,
  type CsvScoutRecord,
} from "@f/lib/csvScoutDataParser";
import FullWidthCardHeader from "@f/lib/style/fullWidthCardHeader";
import { useState } from "react";
import { Button } from "react-bootstrap";

const CSV_ID_CONSTRAINT_LEGEND = `type CurrentUnitId =
  | "bvs"
  | "cs"
  | "bs"
  | "vs"
  | "rs"
  | "ob"

type UnitKey = "bvs" | "cs" | "bs" | "vs" | "rs"

type EventType =
  | "camp"
  | "volunteer"
  | "training"
  | "overseas"
  | "award"
  | "other"

type GradeIdByUnit = {
  bvs: "beaver" | "bigbeaver"
  cs: "rabbit" | "deer" | "bear"
  bs: "beginner" | "second" | "first" | "mum"
  vs: "venture" | "falcon" | "fuji"
  rs: never
}

type GradeFlatField = "completed" | "completedDate" | "details"

type GradeFlatKey =
  | "bvs-grade-beaver-completed"
  | "bvs-grade-beaver-completedDate"
  | "bvs-grade-beaver-details"
  | "bvs-grade-bigbeaver-completed"
  | "bvs-grade-bigbeaver-completedDate"
  | "bvs-grade-bigbeaver-details"
  | "cs-grade-rabbit-completed"
  | "cs-grade-rabbit-completedDate"
  | "cs-grade-rabbit-details"
  | "cs-grade-deer-completed"
  | "cs-grade-deer-completedDate"
  | "cs-grade-deer-details"
  | "cs-grade-bear-completed"
  | "cs-grade-bear-completedDate"
  | "cs-grade-bear-details"
  | "bs-grade-beginner-completed"
  | "bs-grade-beginner-completedDate"
  | "bs-grade-beginner-details"
  | "bs-grade-second-completed"
  | "bs-grade-second-completedDate"
  | "bs-grade-second-details"
  | "bs-grade-first-completed"
  | "bs-grade-first-completedDate"
  | "bs-grade-first-details"
  | "bs-grade-mum-completed"
  | "bs-grade-mum-completedDate"
  | "bs-grade-mum-details"
  | "vs-grade-venture-completed"
  | "vs-grade-venture-completedDate"
  | "vs-grade-venture-details"
  | "vs-grade-falcon-completed"
  | "vs-grade-falcon-completedDate"
  | "vs-grade-falcon-details"
  | "vs-grade-fuji-completed"
  | "vs-grade-fuji-completedDate"
  | "vs-grade-fuji-details"

type CsvRecordIdConstraints = {
  personal: {
    currentUnitId: CurrentUnitId
  }
  unit: Record<UnitKey, unknown>
  gradeFlatKey: GradeFlatKey
  event: { type: EventType }[]
}`;

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
              <div className="mt-3">
                <h5>区切り文字ルール</h5>
                <ul className="mb-2">
                  <li>
                    <code>,</code>: CSVカラム区切り
                  </li>
                  <li>
                    <code>|</code>: 配列アイテム区切り
                  </li>
                  <li>
                    <code>~</code>: オブジェクト内フィールド区切り
                  </li>
                  <li>
                    <code>^</code>: details配列のアイテム区切り
                  </li>
                  <li>
                    <code>:</code>: details配列アイテム内のフィールド区切り
                  </li>
                </ul>
                <p className="mb-0">
                  区切り文字そのものを値に含めるときは <code>\</code>{" "}
                  でエスケープ （例: <code>foo\|bar</code>）
                </p>
              </div>
              <div className="mt-3">
                <h5>ネストされるデータの説明</h5>
                <ul className="mb-0">
                  <li>
                    <code>unit.*.work</code> は <code>name~begin~end</code> を
                    <code>|</code> で連結した配列
                  </li>
                  <li>
                    <code>unit.*.grade</code> は CSV上で
                    <code>bvs-grade-beaver-completed</code> /
                    <code>bvs-grade-beaver-completedDate</code> /
                    <code>bvs-grade-beaver-details</code> のような
                    flatキー列で表現
                  </li>
                  <li>
                    <code>ginosho</code> も同様に
                    <code>uniqueId~certBy~achievedDate~details</code> 形式で、
                    <code>details</code> は <code>achievedDate:done</code> の
                    <code>^</code> 連結
                  </li>
                </ul>
              </div>
              <div className="mt-3">
                <h5>型定義（ID制約のみ）</h5>
                <p className="mb-2">以下以外のIDは受け付けません</p>
                <pre className="bg-light border rounded p-2 mb-0">
                  <code>{CSV_ID_CONSTRAINT_LEGEND}</code>
                </pre>
              </div>
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
