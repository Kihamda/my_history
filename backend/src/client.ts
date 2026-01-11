import { hc, type InferResponseType } from "hono/client";
import app from "./index";

type Client = ReturnType<typeof hc<typeof app>>;
const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

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
