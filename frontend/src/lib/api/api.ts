import {
  createClient,
  type ClientType,
  type InferResponseType,
  type SuccessStatusCode,
} from "@b/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { raiseError } from "@f/errorHandler";

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "/";

export let hc: ClientType = createClient(BASE_URL); // APIクライアントを格納する変数
export const setHcClient = (token?: string) => {
  hc = createClient(BASE_URL, token);
};

const showError = (error: Error) => raiseError(error.message);
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: showError }),
  mutationCache: new MutationCache({ onError: showError }),
  defaultOptions: {
    queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
export const apiJson = async <T>(
  request: Promise<Response> | Response,
  fallback: string,
): Promise<T> => {
  const response = await request;
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(body.message || fallback);
  return body;
};

// GETのqueryパラメータ、POSTのjson/formボディを取得
export type ReqType<T> =
  (T extends (...args: infer A) => unknown ? A : never)[0];

export type ResType<T> = InferResponseType<T, SuccessStatusCode>;
