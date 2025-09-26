export interface FirebaseAuthBindings {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_EMULATOR_HOST?: string;
}

export interface MasterDataBindings {
  /**
   * Optional Cloudflare KV namespace used for caching master data such as
   * 技能章や進級章のメタ情報。
   */
  MASTER_CACHE?: KVNamespace;
  /**
   * 任意の外部データソースを利用する場合のベースURL。
   * 例: https://raw.githubusercontent.com/ユーザー/レポジトリ/ブランチ/masterRecord/data
   */
  MASTER_DATA_BASE_URL?: string;
}

export type AppBindings = FirebaseAuthBindings &
  MasterDataBindings & {
    PUBLIC_JWK_CACHE_KEY?: string;
    PUBLIC_JWK_CACHE_KV?: KVNamespace;
  };
