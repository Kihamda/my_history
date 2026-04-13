import { hc, type InferResponseType } from "hono/client";
import type { ResponseFormat } from "hono/types";
import type { StatusCode } from "hono/utils/http-status";
import type { AppType } from "./index";

type Client = ReturnType<typeof hc<AppType>>;
const hcWithType = (...args: Parameters<typeof hc<AppType>>): Client =>
  hc<AppType>(...args);

declare module "hono/client" {
  interface ClientResponse<
    T,
    U extends number = StatusCode,
    F extends ResponseFormat = ResponseFormat,
  > {
    json(): F extends "text"
      ? Promise<never>
      : F extends "json"
        ? Promise<T extends object ? T & { message?: string } : T>
        : Promise<unknown>;
  }
}

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
