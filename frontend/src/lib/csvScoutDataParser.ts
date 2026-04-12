// ================================================================
// CSV Scout Data Parser / Encoder
// ================================================================
// ScoutRecordSchema (backend/src/lib/firestore/schemas.ts) に準拠した
// CSV⇔オブジェクト変換。godmode バッチ処理用。
//
// 区切り文字階層:
//   , = CSVカラム
//   | = 配列アイテム
//   ~ = オブジェクト内フィールド
//   ^ = サブ配列(details)アイテム
//   : = サブ配列内フィールド
// ================================================================

import type { hc, ResType } from "./api/api";

// ---------- 型定義 ----------

export interface CsvScoutRecord extends ResType<
  (typeof hc.apiv1.scout)[":id"]["$get"]
> {
  id: string;
}

type Detail = CsvScoutRecord["ginosho"][number]["details"][number];
type UnitWork = CsvScoutRecord["unit"]["bvs"]["work"][number];
type UnitGrade = CsvScoutRecord["unit"]["bvs"]["grade"][number];
type Ginosho = CsvScoutRecord["ginosho"][number];
type ScoutEvent = CsvScoutRecord["event"][number];
type EventType = ScoutEvent["type"];
type UnitIdWithOb = CsvScoutRecord["personal"]["currentUnitId"];
type UnitId = Exclude<UnitIdWithOb, "ob">;
type UnitData = CsvScoutRecord["unit"][UnitId];

// ---------- 定数 ----------

const UNIT_IDS: UnitId[] = ["bvs", "cs", "bs", "vs", "rs"];

// カラム名一覧（順序が重要）
const COLUMNS = [
  "id",
  "belongGroupId",
  "name",
  "scoutId",
  "birthDate",
  "joinedDate",
  "currentUnitId",
  "memo",
  "declare_date",
  "declare_place",
  "declare_done",
  "religion_date",
  "religion_type",
  "religion_done",
  "faith_date",
  "faith_done",
  ...UNIT_IDS.flatMap((u) => [
    `${u}_experienced`,
    `${u}_joinedDate`,
    `${u}_work`,
    `${u}_grade`,
  ]),
  "ginosho",
  "event",
  "last_Edited",
] as const;

export const HEADER_LINE = COLUMNS.join(",");

// ---------- ヘルパー ----------

const b2s = (v: boolean): string => (v ? "1" : "0");
const s2b = (v: string): boolean => v === "1";
const nullable = (v: string | null): string => v ?? "";
const toNullable = (v: string): string | null => (v === "" ? null : v);

// 記号（~|^:\）をエスケープ・アンエスケープする関数（Excel等での編集を考慮し人間が読める範囲で）
const escapeField = (v: string): string => v.replace(/([~|^:\\])/g, "\\$1");
const unescapeField = (v: string): string => v.replace(/\\([~|^:\\])/g, "$1");

// エスケープされていない区切り文字でsplitする
const splitSafe = (v: string, delimiter: string): string[] => {
  if (v === "") return [];
  const regex = new RegExp(`(?<!\\\\)\\${delimiter}`);
  return v.split(regex).map(unescapeField);
};

const encodeDetails = (details: Detail[]): string =>
  details
    .map((d) => `${escapeField(nullable(d.achievedDate))}:${b2s(d.done)}`)
    .join("^");

const decodeDetails = (raw: string): Detail[] => {
  if (raw === "") return [];
  return raw.split(/(?<!\\)\^/).map((part) => {
    const [achievedDate, done] = splitSafe(part, ":");
    return { achievedDate: toNullable(achievedDate), done: s2b(done) };
  });
};

const encodeWork = (work: UnitWork[]): string =>
  work
    .map(
      (w) =>
        `${escapeField(w.name)}~${escapeField(w.begin)}~${escapeField(nullable(w.end))}`,
    )
    .join("|");

const decodeWork = (raw: string): UnitWork[] => {
  if (raw === "") return [];
  return raw.split(/(?<!\\)\|/).map((part) => {
    const [name, begin, end] = splitSafe(part, "~");
    return { name, begin, end: toNullable(end) };
  });
};

const encodeGrade = (grade: UnitGrade[]): string =>
  grade
    .map(
      (g) =>
        `${escapeField(g.uniqueId)}~${escapeField(g.completedDate)}~${b2s(g.completed)}~${encodeDetails(g.details)}`,
    )
    .join("|");

const decodeGrade = (raw: string): UnitGrade[] => {
  if (raw === "") return [];
  return raw.split(/(?<!\\)\|/).map((part) => {
    const subParts = part.split(/(?<!\\)~/);
    return {
      uniqueId: unescapeField(subParts[0] || ""),
      completedDate: unescapeField(subParts[1] || ""),
      completed: s2b(unescapeField(subParts[2] || "")),
      details: decodeDetails(subParts.slice(3).join("~")),
    };
  });
};

const encodeGinosho = (ginosho: Ginosho[]): string =>
  ginosho
    .map(
      (g) =>
        `${escapeField(g.uniqueId)}~${escapeField(g.certBy)}~${escapeField(nullable(g.achievedDate))}~${encodeDetails(g.details)}`,
    )
    .join("|");

const decodeGinosho = (raw: string): Ginosho[] => {
  if (raw === "") return [];
  return raw.split(/(?<!\\)\|/).map((part) => {
    const subParts = part.split(/(?<!\\)~/);
    return {
      uniqueId: unescapeField(subParts[0] || ""),
      certBy: unescapeField(subParts[1] || ""),
      achievedDate: toNullable(unescapeField(subParts[2] || "")),
      details: decodeDetails(subParts.slice(3).join("~")),
    };
  });
};

const encodeEvents = (events: ScoutEvent[]): string =>
  events
    .map(
      (e) =>
        `${escapeField(e.name)}~${escapeField(e.type)}~${escapeField(e.startDate)}~${escapeField(e.endDate)}~${escapeField(e.description)}`,
    )
    .join("|");

const decodeEvents = (raw: string): ScoutEvent[] => {
  if (raw === "") return [];
  return raw.split(/(?<!\\)\|/).map((part) => {
    const [name, type, startDate, endDate, description] = splitSafe(part, "~");
    return {
      name,
      type: type as EventType,
      startDate,
      endDate,
      description: description ?? "",
    };
  });
};

// ---------- CSV Core Parser/Encoder ----------

const parseCsvFormat = (csvText: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"' && csvText[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n" || (char === "\r" && csvText[i + 1] === "\n")) {
        if (char === "\r") i++;
        row.push(field);
        // 空行はスキップ
        if (row.length > 1 || row[0] !== "") {
          result.push(row);
        }
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") {
      result.push(row);
    }
  }
  return result;
};

const encodeCsvValue = (text: string): string => {
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

// ---------- Parser ----------

const csvScoutDataParser = (raw: string) => {
  const EXPECTED = COLUMNS.length;

  const allLines = parseCsvFormat(raw);

  // ヘッダー行に一致するものは除外
  const dataLines = allLines.filter((row) => row.join(",") !== HEADER_LINE);

  const validLines = dataLines.filter((cols) => cols.length === EXPECTED);
  const droppedLines = dataLines.filter((cols) => cols.length !== EXPECTED);

  const parsedData: CsvScoutRecord[] = validLines.map((c) => {
    let i = 0;
    const next = () => c[i++];

    const id = next();
    const belongGroupId = next();
    const name = next();
    const scoutId = next();
    const birthDate = next();
    const joinedDate = next();
    const currentUnitId = next() as UnitIdWithOb;
    const memo = next();
    const declare_date = next();
    const declare_place = next();
    const declare_done = next();
    const religion_date = next();
    const religion_type = next();
    const religion_done = next();
    const faith_date = next();
    const faith_done = next();

    const unit = {} as Record<UnitId, UnitData>;
    for (const uid of UNIT_IDS) {
      unit[uid] = {
        experienced: s2b(next()),
        joinedDate: next(),
        work: decodeWork(next()),
        grade: decodeGrade(next()),
      };
    }

    const ginosho = decodeGinosho(next());
    const event = decodeEvents(next());
    const last_Edited = next();

    return {
      id,
      belongGroupId,
      personal: {
        name,
        scoutId,
        birthDate,
        joinedDate,
        currentUnitId,
        memo,
        declare: {
          date: declare_date,
          place: declare_place,
          done: s2b(declare_done),
        },
        religion: {
          date: religion_date,
          type: religion_type,
          done: s2b(religion_done),
        },
        faith: { date: faith_date, done: s2b(faith_done) },
      },
      unit,
      ginosho,
      event,
      last_Edited,
    };
  });

  return { parsedData, droppedLines };
};

// ---------- Encoder ----------

export const csvScoutDataEncoder = (records: CsvScoutRecord[]): string => {
  const lines = records.map((r) => {
    const cols: string[] = [
      r.id,
      r.belongGroupId,
      r.personal.name,
      r.personal.scoutId,
      r.personal.birthDate,
      r.personal.joinedDate,
      r.personal.currentUnitId,
      r.personal.memo,
      r.personal.declare.date,
      r.personal.declare.place,
      b2s(r.personal.declare.done),
      r.personal.religion.date,
      r.personal.religion.type,
      b2s(r.personal.religion.done),
      r.personal.faith.date,
      b2s(r.personal.faith.done),
    ];

    for (const uid of UNIT_IDS) {
      const u = r.unit[uid];
      cols.push(
        b2s(u.experienced),
        u.joinedDate,
        encodeWork(u.work),
        encodeGrade(u.grade),
      );
    }

    cols.push(encodeGinosho(r.ginosho), encodeEvents(r.event), r.last_Edited);

    return cols.map(encodeCsvValue).join(",");
  });

  return [HEADER_LINE, ...lines].join("\n");
};

export default csvScoutDataParser;
