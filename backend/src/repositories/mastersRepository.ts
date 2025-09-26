// 技能章・進級マスターを取得するリポジトリ。
import type { AppBindings } from "../types/bindings";
import type {
  GinoshoDetailMaster,
  GinoshoMaster,
  GradeMaster,
  MasterCacheEntry,
} from "../types/domain/masters";

const DEFAULT_MASTER_BASE =
  "https://raw.githubusercontent.com/Kihamda/my_history_v2/dev/masterRecord/data";

const enum CacheKey {
  GinoshoList = "master:ginosho:list",
  GradeList = "master:grade:list",
}

const cacheTtlSeconds = 60 * 60 * 12; // 12 hours

// Cloudflare KV が設定されている場合はキャッシュを優先し、無ければ直接 fetch する。
const withCache = async <T>(
  env: AppBindings,
  key: string,
  loader: () => Promise<T>
): Promise<T> => {
  if (!env.MASTER_CACHE) {
    return loader();
  }

  const cached = await env.MASTER_CACHE.get<MasterCacheEntry<T>>(key, {
    type: "json",
  });
  if (cached?.value) {
    return cached.value;
  }

  const value = await loader();
  await env.MASTER_CACHE.put(
    key,
    JSON.stringify({ value, cachedAt: new Date().toISOString() }),
    {
      expirationTtl: cacheTtlSeconds,
    }
  );
  return value;
};

// GitHub Raw などの外部ソースから JSON を取得し、型パラメータで型付けする。
const fetchMasterJson = async <T>(
  env: AppBindings,
  path: string
): Promise<T> => {
  const base = env.MASTER_DATA_BASE_URL ?? DEFAULT_MASTER_BASE;
  const url = `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
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

export const getGinoshoMasterList = async (
  env: AppBindings
): Promise<GinoshoMaster[]> =>
  // 技能章一覧は KV キャッシュを活用して取得回数を抑える。
  withCache(env, CacheKey.GinoshoList, () =>
    fetchMasterJson<GinoshoMaster[]>(env, "ginosho.json")
  );

export const getGinoshoDetail = async (
  env: AppBindings,
  id: string
): Promise<GinoshoDetailMaster | null> => {
  // 詳細はキャッシュせず都度取得。取得できなければ null を返す。
  const data = await fetchMasterJson<GinoshoDetailMaster | null>(
    env,
    `ginosho/${id}.json`
  ).catch(() => null);
  return data;
};

export const getGradeMasterList = async (
  env: AppBindings
): Promise<GradeMaster[]> =>
  // 進級章一覧も同様にキャッシュ可能。
  withCache(env, CacheKey.GradeList, () =>
    fetchMasterJson<GradeMaster[]>(env, "grade.json")
  );

export const getGradeMaster = async (
  env: AppBindings,
  id: string
): Promise<GradeMaster | null> => {
  // 個別の進級章は存在しない場合に備えて null を許容。
  const data = await fetchMasterJson<GradeMaster | null>(
    env,
    `grade/${id}.json`
  ).catch(() => null);
  return data;
};
