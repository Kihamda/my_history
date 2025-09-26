import { hc } from "hono/client";
import type { AppType } from "./index";

export type Client = ReturnType<typeof createClient>;

// 認証なしでバックエンドにアクセスするための最小クライアント生成。
export const createClient = (baseUrl: string) => hc<AppType>(baseUrl);

// Bearer トークン付きのクライアントを生成し、API を認証状態で呼び出す。
export const createAuthenticatedClient = (baseUrl: string, idToken: string) =>
  hc<AppType>(baseUrl, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

export type { AppType } from "./index";
