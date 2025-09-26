import { createAuthenticatedClient, createClient } from "b@/src/client";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const api = createClient(apiBaseUrl);

export let authApi = createAuthenticatedClient(apiBaseUrl, "");

export const setAuthToken = (token: string) => {
  authApi = createAuthenticatedClient(apiBaseUrl, token);
};
