import type { AppBindings } from "../types/bindings";

export interface MasterEntry {
  id: string;
  name: string;
  url?: string;
  description?: string;
}

const DEFAULT_MASTER_BASE =
  "https://raw.githubusercontent.com/Kihamda/my_history_v2/dev/masterRecord/data";

const LIST_CACHE_TTL = 1000 * 60 * 60; // 1 hour
const DETAIL_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

type MasterListEntry = {
  id: string;
  name: string;
  url?: string;
  source: "ginosho" | "grade";
};

type GinoshoListItem = {
  id: string;
  name: string;
  url?: string;
};

type GradeListItem = {
  id: string;
  name: string;
};

type DetailResponse = {
  id: string;
  name: string;
  url?: string;
  details?: Array<{ description?: string | null }>;
};

const masterListCache: {
  value: Map<string, MasterListEntry>;
  expiresAt: number;
} = {
  value: new Map(),
  expiresAt: 0,
};

const masterDetailCache = new Map<
  string,
  { value?: string; expiresAt: number }
>();

const resolveBaseUrl = (env: AppBindings): string =>
  (env.MASTER_DATA_BASE_URL ?? DEFAULT_MASTER_BASE).replace(/\/$/, "");

const fetchJson = async <T>(env: AppBindings, path: string): Promise<T> => {
  const base = resolveBaseUrl(env);
  const url = `${base}/${path.replace(/^\//, "")}`;
  const response = await fetch(url, {
    headers: {
      "Cache-Control": "max-age=600",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch master data: ${response.status} ${url}`);
  }

  return (await response.json()) as T;
};

const ensureMasterList = async (
  env: AppBindings
): Promise<Map<string, MasterListEntry>> => {
  if (masterListCache.value.size && masterListCache.expiresAt > Date.now()) {
    return masterListCache.value;
  }

  const [ginoshoList, gradeList] = await Promise.all([
    fetchJson<GinoshoListItem[]>(env, "ginosho.json").catch(() => []),
    fetchJson<GradeListItem[]>(env, "grade.json").catch(() => []),
  ]);

  const map = new Map<string, MasterListEntry>();

  for (const item of ginoshoList) {
    map.set(item.id, {
      id: item.id,
      name: item.name,
      url: item.url,
      source: "ginosho",
    });
  }

  for (const item of gradeList) {
    map.set(item.id, {
      id: item.id,
      name: item.name,
      source: "grade",
    });
  }

  masterListCache.value = map;
  masterListCache.expiresAt = Date.now() + LIST_CACHE_TTL;

  return map;
};

const loadMasterDescription = async (
  env: AppBindings,
  entry: MasterListEntry
): Promise<string | undefined> => {
  const cached = masterDetailCache.get(entry.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const detailPath =
    entry.source === "ginosho"
      ? `ginosho/${entry.id}.json`
      : `grade/${entry.id}.json`;

  const detail = await fetchJson<DetailResponse>(env, detailPath).catch(
    () => null
  );

  const description = detail?.details
    ?.map((item) => item.description)
    .filter((value): value is string => Boolean(value && value.trim()))
    .join("\n");

  masterDetailCache.set(entry.id, {
    value: description ?? undefined,
    expiresAt: Date.now() + DETAIL_CACHE_TTL,
  });

  return description ?? undefined;
};

export const enrichMasterData = async (
  env: AppBindings,
  ids: string[]
): Promise<MasterEntry[]> => {
  const uniqueIds = Array.from(
    new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0))
  );

  if (!uniqueIds.length) {
    return [];
  }

  const masterMap = await ensureMasterList(env);

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const base = masterMap.get(id);
      if (!base) {
        return {
          id,
          name: id,
        } satisfies MasterEntry;
      }

      const description = await loadMasterDescription(env, base).catch(
        () => undefined
      );

      return {
        id: base.id,
        name: base.name,
        url: base.url,
        description,
      } satisfies MasterEntry;
    })
  );

  return entries;
};
