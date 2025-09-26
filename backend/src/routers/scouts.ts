import { Hono } from "hono";
import type { Context } from "hono";
import { FirebaseAuthError } from "../firebase";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";
import {
  getScoutRecord,
  searchScouts,
  updateScoutRecord,
} from "../repositories/scoutsRepository";
import { getUserSettings } from "../repositories/usersRepository";
import { getCurrentGroupContext } from "../repositories/groupsRepository";
import type {
  GradeDetailProgress,
  ScoutEvent,
  ScoutGinosho,
  ScoutGinoshoDetail,
  ScoutRecord,
  ScoutUnitGrade,
  ScoutWork,
  ScoutPersonalData,
  UnitExperience,
} from "../types/domain/scout";

// JSON パース時に型引数を適用するための共通コンテキスト型。
type RouterContext = Context<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>;

// 検索条件で利用するフィルター値の型定義。
interface ScoutSearchRequest {
  name?: string;
  scoutId?: string;
  currentUnit?: string[];
  limit?: number;
}

// 期待しないペイロードを検出した場合の定形エラー生成ヘルパー。
const invalidPayload = (field: string): FirebaseAuthError =>
  new FirebaseAuthError(`Invalid payload: ${field}`, 400, "INVALID_PAYLOAD");

// 共通の JSON パース処理。失敗時はクライアントエラーを通知する。
const parseJsonBody = async <T>(c: RouterContext): Promise<T> => {
  try {
    return (await c.req.json()) as T;
  } catch (error) {
    console.warn("Failed to parse JSON payload", error);
    throw new FirebaseAuthError("INVALID_JSON", 400, "INVALID_JSON");
  }
};

const toStringId = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return fallback;
};

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  return undefined;
};

const toOptionalISODate = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return undefined;
};

// 隊員が従事した作業情報を構造化する。
const sanitizeScoutWork = (value: unknown, index: number): ScoutWork => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`unit.works[${index}]`);
  }
  const input = value as Record<string, unknown>;
  return {
    id: toStringId(input.id, `work-${index}`),
    type: typeof input.type === "string" ? input.type : "",
    begin: toOptionalISODate(input.begin),
    end: toOptionalISODate(input.end),
  };
};

const sanitizeGradeDetail = (
  value: unknown,
  index: number
): GradeDetailProgress => {
  // 進級章の詳細項目を検証し、欠損時はデフォルト値を補う。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`unit.grade.details[${index}]`);
  }
  const input = value as Record<string, unknown>;
  return {
    id: toStringId(input.id, `detail-${index}`),
    number: toOptionalString(input.number),
    description: toOptionalString(input.description),
    has: Boolean(input.has),
    date: toOptionalISODate(input.date),
  };
};

const sanitizeUnitGrade = (value: unknown, index: number): ScoutUnitGrade => {
  // 進級章の達成状況を正規化する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`unit.grade[${index}]`);
  }
  const input = value as Record<string, unknown>;
  const id = toStringId(input.id, `grade-${index}`);
  const unique = toStringId(input.unique, id);
  return {
    id,
    unique,
    name: toOptionalString(input.name),
    has: Boolean(input.has),
    date: toOptionalISODate(input.date),
    details: Array.isArray(input.details)
      ? input.details.map((detail, detailIndex) =>
          sanitizeGradeDetail(detail, detailIndex)
        )
      : [],
  };
};

const sanitizeUnitExperience = (
  value: unknown,
  index: number
): UnitExperience => {
  // 所属隊の経験履歴を配列形式から内部表現へ整形する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`unit[${index}]`);
  }
  const input = value as Record<string, unknown>;
  return {
    id: toStringId(input.id, `unit-${index}`),
    name: toOptionalString(input.name),
    joinedDate: toOptionalISODate(input.joinedDate),
    experienced: Boolean(input.experienced),
    grade: Array.isArray(input.grade)
      ? input.grade.map((item, gradeIndex) =>
          sanitizeUnitGrade(item, gradeIndex)
        )
      : [],
    works: Array.isArray(input.works)
      ? input.works.map((item, workIndex) => sanitizeScoutWork(item, workIndex))
      : [],
  };
};

const sanitizeGinoshoDetail = (
  value: unknown,
  index: number
): ScoutGinoshoDetail => {
  // 技能章の細目を検証し、ソート順や日付を正規化する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`ginosho.details[${index}]`);
  }
  const input = value as Record<string, unknown>;
  return {
    sort:
      typeof input.sort === "number" && Number.isInteger(input.sort)
        ? input.sort
        : index + 1,
    number: toOptionalString(input.number),
    description: toOptionalString(input.description),
    has: Boolean(input.has),
    date: toOptionalISODate(input.date),
  };
};

const sanitizeGinosho = (value: unknown, index: number): ScoutGinosho => {
  // 技能章本体のメタ情報を安全に抽出する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`ginosho[${index}]`);
  }
  const input = value as Record<string, unknown>;
  const id = toStringId(input.id, `ginosho-${index}`);
  const unique = toStringId(input.unique, id);
  return {
    id,
    unique,
    name: toOptionalString(input.name),
    certName: toOptionalString(input.certName),
    cert: typeof input.cert === "boolean" ? input.cert : undefined,
    date: toOptionalISODate(input.date),
    has: Boolean(input.has),
    url: toOptionalString(input.url),
    details: Array.isArray(input.details)
      ? input.details.map((detail, detailIndex) =>
          sanitizeGinoshoDetail(detail, detailIndex)
        )
      : [],
  };
};

const sanitizeEvent = (value: unknown, index: number): ScoutEvent => {
  // 活動イベントの入力を検証し、最低限の文字列を保証する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload(`events[${index}]`);
  }
  const input = value as Record<string, unknown>;
  return {
    id: toStringId(input.id, `event-${index}`),
    title: typeof input.title === "string" ? input.title : "",
    description: toOptionalString(input.description),
    type: toOptionalString(input.type),
    start: toOptionalISODate(input.start),
    end: toOptionalISODate(input.end),
  };
};

const sanitizePersonal = (
  value: unknown,
  groupId: string
): ScoutPersonalData => {
  // 個人情報の必須項目を確認し、所属団IDの整合性を付与する。
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload("personal");
  }
  const input = value as Record<string, unknown>;
  if (typeof input.name !== "string" || !input.name.trim()) {
    throw invalidPayload("personal.name");
  }

  const personal: ScoutPersonalData = {
    name: input.name,
    ScoutId: typeof input.ScoutId === "string" ? input.ScoutId : undefined,
    currentUnit:
      typeof input.currentUnit === "string" ? input.currentUnit : undefined,
    belongs: groupId,
  };

  for (const [key, val] of Object.entries(input)) {
    if (key === "name" || key === "ScoutId" || key === "currentUnit") {
      continue;
    }
    if (key === "belongs") {
      continue;
    }
    personal[key] = val;
  }

  return personal;
};

const sanitizeScoutUpdate = (
  payload: unknown,
  scoutId: string,
  groupId: string
): ScoutRecord => {
  // PUT された全体構造を走査し、サーバー側の整合性を担保する。
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidPayload("body");
  }

  const input = payload as Record<string, unknown>;
  const providedId = input.id ? String(input.id) : scoutId;
  if (providedId !== scoutId) {
    throw new FirebaseAuthError("SCOUT_ID_MISMATCH", 400, "SCOUT_ID_MISMATCH");
  }

  const personal = sanitizePersonal(input.personal, groupId);

  const unit = Array.isArray(input.unit)
    ? input.unit.map((item, index) => sanitizeUnitExperience(item, index))
    : [];

  const ginosho = Array.isArray(input.ginosho)
    ? input.ginosho.map((item, index) => sanitizeGinosho(item, index))
    : [];

  const events = Array.isArray(input.events)
    ? input.events.map((item, index) => sanitizeEvent(item, index))
    : [];

  return {
    id: scoutId,
    personal,
    unit,
    ginosho,
    events,
    updatedAt: toOptionalISODate(input.updatedAt),
  };
};

const ensureUserContext = async (c: RouterContext) => {
  // ユーザーの所属・権限を取得し、団情報が揃わなければエラーを返す。
  const auth = c.get("auth");
  const settings = await getUserSettings(c.env, auth.token, auth.user);

  if (!settings.joinGroupId) {
    throw new FirebaseAuthError(
      "GROUP_NOT_ASSIGNED",
      403,
      "GROUP_NOT_ASSIGNED"
    );
  }

  const context = await getCurrentGroupContext(
    c.env,
    auth.token,
    settings.joinGroupId,
    auth.user.email
  );

  if (!context) {
    throw new FirebaseAuthError("GROUP_NOT_FOUND", 403, "GROUP_NOT_FOUND");
  }

  return { auth, settings, context };
};

const parseSearchRequest = (payload: unknown): ScoutSearchRequest => {
  // 検索 API の POST ボディから妥当なフィルターのみを抽出する。
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidPayload("body");
  }
  const input = payload as Record<string, unknown>;
  const filters: ScoutSearchRequest = {};

  if (typeof input.name === "string" && input.name.trim()) {
    filters.name = input.name.trim();
  }

  if (typeof input.scoutId === "string" && input.scoutId.trim()) {
    filters.scoutId = input.scoutId.trim();
  }

  if (Array.isArray(input.currentUnit)) {
    const units = input.currentUnit.filter((unit) => typeof unit === "string");
    if (units.length) {
      filters.currentUnit = units as string[];
    }
  }

  if ("limit" in input) {
    const limit = input.limit;
    if (limit === null || limit === undefined) {
      // omit
    } else if (typeof limit === "number" && Number.isInteger(limit)) {
      filters.limit = Math.max(1, Math.min(100, limit));
    } else {
      throw invalidPayload("limit");
    }
  }

  if (!filters.name && !filters.scoutId && !filters.currentUnit?.length) {
    throw new FirebaseAuthError("FILTER_REQUIRED", 400, "FILTER_REQUIRED");
  }

  return filters;
};

// 隊員情報の検索・取得・更新をまとめたルーター。
const scoutsRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

  // すべてのリクエストに対して認証と所属チェックを要求する。
  .use("*", requireAuth)

  // 個別隊員を取得する。所属が異なる場合は権限エラー。
  .get("/:scoutId", async (c) => {
    const { auth, context } = await ensureUserContext(c);
    const scoutId = c.req.param("scoutId");
    const record = await getScoutRecord(c.env, auth.token, scoutId);

    if (!record) {
      return c.json(
        {
          error: "SCOUT_NOT_FOUND",
        },
        404
      );
    }

    if (record.personal?.belongs && record.personal.belongs !== context.id) {
      throw new FirebaseAuthError("SCOUT_FORBIDDEN", 403, "SCOUT_FORBIDDEN");
    }

    return c.json(record);
  })

  // 隊員情報を更新する。編集権限がない場合は 403 を返す。
  .put("/:scoutId", async (c) => {
    const { auth, context } = await ensureUserContext(c);

    if (!context.isEditable) {
      throw new FirebaseAuthError(
        "SCOUT_WRITE_FORBIDDEN",
        403,
        "SCOUT_WRITE_FORBIDDEN"
      );
    }

    const scoutId = c.req.param("scoutId");
    const body = await parseJsonBody<unknown>(c);
    const record = sanitizeScoutUpdate(body, scoutId, context.id);

    await updateScoutRecord(c.env, auth.token, record);
    const updated = await getScoutRecord(c.env, auth.token, scoutId);

    return c.json(updated ?? record);
  })

  // 検索条件を基に隊員を検索する。リーダー以上のみ利用可能。
  .post("/search", async (c) => {
    const { auth, context } = await ensureUserContext(c);

    if (!context.isLeader) {
      throw new FirebaseAuthError("SCOUT_SEARCH_FORBIDDEN", 403, "FORBIDDEN");
    }

    const body = await parseJsonBody<unknown>(c);
    const filters = parseSearchRequest(body);

    const results = await searchScouts(c.env, auth.token, {
      groupId: context.id,
      name: filters.name,
      scoutId: filters.scoutId,
      currentUnit: filters.currentUnit,
      limit: filters.limit,
    });

    const normalized = filters.name?.toLowerCase();
    const filtered = normalized
      ? results.filter((item) => item.name?.toLowerCase().includes(normalized))
      : results;

    return c.json({
      items: filtered,
    });
  });

export default scoutsRouter;
