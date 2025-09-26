import { createAuthenticatedClient, createClient } from "b@/src/client";

const DEFAULT_API_BASE_URL = "http://localhost:8787";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const honoClient = createClient(apiBaseUrl);

export let authApi = createClient(apiBaseUrl);

export const setAuthToken = (token?: string | null) => {
  authApi =
    token && token.trim().length > 0
      ? createAuthenticatedClient(apiBaseUrl, token)
      : createClient(apiBaseUrl);
};
