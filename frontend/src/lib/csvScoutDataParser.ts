export const HEADER_LINE =
  "id,scoutId,belongCurrentIds,belongGroupId,createdAt,updatedAt,note";

const csvScoutDataParser = (raw: string) => {
  // 定数
  const EXPECTED_COLUMN_COUNT = HEADER_LINE.split(",").length;

  // 行に分割
  const lines = raw
    .split("\n")
    .map((line) => line.trim().split(","))
    .filter((line) => line.length == EXPECTED_COLUMN_COUNT);
  const droppedLines = raw
    .split("\n")
    .map((line) => line.trim().split(","))
    .filter((line) => line.length != EXPECTED_COLUMN_COUNT);

  // オブジェクトに変換
  const result = lines.map((columns) => ({
    id: columns[0],
    scoutId: columns[1],
  }));
  return { parsedData: result, droppedLines: droppedLines };
};

export default csvScoutDataParser;
