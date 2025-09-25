import { hc } from "hono/client";
import type { AppType } from "./index";

export type Client = ReturnType<typeof createClient>;

export const createClient = (baseUrl: string) => hc<AppType>(baseUrl);

export const createAuthenticatedClient = (baseUrl: string, idToken: string) =>
  hc<AppType>(baseUrl, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

export type { AppType } from "./index";
