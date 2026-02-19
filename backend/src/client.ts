import { hc, type InferResponseType } from "hono/client";
import type { AppType } from "./index";

type Client = ReturnType<typeof hc<AppType>>;
const hcWithType = (...args: Parameters<typeof hc<AppType>>): Client =>
  hc<AppType>(...args);

export type ClientType = ReturnType<typeof createClient>;
// 認証なしでバックエンドにアクセスするための最小クライアント生成。
export const createClient = (baseUrl: string, token?: string) => {
  if (!token) {
    return hcWithType(baseUrl);
  }
  return hcWithType(baseUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export type { InferResponseType };
export type { Client };
