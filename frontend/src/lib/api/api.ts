import {
  createClient,
  type ClientType,
  type InferResponseType,
} from "@b/client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : import.meta.env.VITE_API_URL;

export let hc: ClientType = createClient(BASE_URL); // APIクライアントを格納する変数
export const setHcClient = (token?: string) => {
  hc = createClient(BASE_URL, token);
};

// GETのqueryパラメータ、POSTのjson/formボディを取得
export type ReqType<T> = (T extends (...args: infer A) => any ? A : never)[0];

export type ResType<T> = InferResponseType<T>;
