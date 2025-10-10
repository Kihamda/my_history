import { hc } from "hono/client";
import type { AppType } from "./index";

export type ClientType = ReturnType<typeof createClient>;

// 認証なしでバックエンドにアクセスするための最小クライアント生成。
export const createClient = (baseUrl: string, token: string) =>
  hc<AppType>(baseUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

export type { AppType } from "./index";
