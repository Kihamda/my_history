type CacheEntry<V> = {
  value: V;
  expiresAt: number;
};

export type TtlCache<K, V> = {
  get: (key: K) => V | undefined;
  set: (key: K, value: V, ttlMs?: number) => void;
  getMany: (keys: K[]) => { hit: Map<K, V>; miss: K[] };
  clear: () => void;
};

export const createTtlCache = <K, V>(defaultTtlMs: number): TtlCache<K, V> => {
  const store = new Map<K, CacheEntry<V>>();

  const get = (key: K): V | undefined => {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  };

  const set = (key: K, value: V, ttlMs = defaultTtlMs) => {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  };

  const getMany = (keys: K[]) => {
    const hit = new Map<K, V>();
    const miss: K[] = [];

    keys.forEach((key) => {
      const value = get(key);
      if (value === undefined) {
        miss.push(key);
      } else {
        hit.set(key, value);
      }
    });

    return { hit, miss };
  };

  const clear = () => {
    store.clear();
  };

  return { get, set, getMany, clear };
};
