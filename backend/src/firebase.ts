// Firebase Authentication REST API をラップし、認証周りの処理を一箇所に集約する。
import type { FirebaseAuthBindings } from "./types/bindings";

export interface FirebaseAuthUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  providerIds: string[];
  disabled?: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  customClaims?: Record<string, unknown>;
}

export interface TokenBundle {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignInResult {
  tokens: TokenBundle;
  user: FirebaseAuthUser;
}

export interface RefreshResult {
  tokens: TokenBundle;
  user: FirebaseAuthUser;
}

// Firebase 認証周りで発生したエラーを HTTP ステータス付きで保持する。
export class FirebaseAuthError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 401, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface FirebaseErrorPayload {
  error?: {
    code?: number;
    message?: string;
  };
}

interface SignInResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface RefreshResponse {
  id_token: string;
  refresh_token: string;
  expires_in: string;
}

interface LookupResponse {
  users?: Array<{
    localId: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoUrl?: string;
    phoneNumber?: string;
    disabled?: boolean;
    providerUserInfo?: Array<{
      providerId: string;
    }>;
    customAttributes?: string;
    createdAt?: string;
    lastLoginAt?: string;
  }>;
}

type LookupUser = NonNullable<LookupResponse["users"]>[number];

// Identity Toolkit のベースURL (エミュレータ対応) を求める。
const identityToolkitOrigin = (env: FirebaseAuthBindings) =>
  env.FIREBASE_AUTH_EMULATOR_HOST
    ? `http://${env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`
    : "https://identitytoolkit.googleapis.com/v1";

// Secure Token Service のベースURL (エミュレータ対応) を求める。
const secureTokenOrigin = (env: FirebaseAuthBindings) =>
  env.FIREBASE_AUTH_EMULATOR_HOST
    ? `http://${env.FIREBASE_AUTH_EMULATOR_HOST}/securetoken.googleapis.com/v1`
    : "https://securetoken.googleapis.com/v1";

// 必須の環境変数が未設定の場合は 500 エラーを投げて早期に気付けるようにする。
const ensureBinding = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new FirebaseAuthError(
      `Missing binding: ${name}`,
      500,
      "MISSING_CONFIGURATION"
    );
  }
  return value;
};

// Firebase から返るエラーレスポンスをアプリ内のエラー形式へ変換する。
const toAuthError = (
  status: number,
  payload: FirebaseErrorPayload
): FirebaseAuthError => {
  const message = payload.error?.message ?? "AUTH_ERROR";
  const normalizedStatus = mapFirebaseErrorToStatus(message, status);
  return new FirebaseAuthError(message, normalizedStatus, message);
};

// Firebase エラーコードごとに適切な HTTP ステータスへマッピングする。
const mapFirebaseErrorToStatus = (code: string, fallback: number): number => {
  switch (code) {
    case "INVALID_ID_TOKEN":
    case "TOKEN_EXPIRED":
    case "USER_DISABLED":
    case "INVALID_REFRESH_TOKEN":
    case "MISSING_ID_TOKEN":
    case "MISSING_REFRESH_TOKEN":
      return 401;
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
    case "USER_NOT_FOUND":
    case "WEAK_PASSWORD":
      return 400;
    default:
      return fallback;
  }
};

// Identity Toolkit REST API への POST リクエストを共通化する。
const identityToolkitRequest = async <T>(
  env: FirebaseAuthBindings,
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const apiKey = ensureBinding(env.FIREBASE_API_KEY, "FIREBASE_API_KEY");
  const url = new URL(path, identityToolkitOrigin(env));
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as
      | T
      | FirebaseErrorPayload;

    if (!response.ok) {
      throw toAuthError(response.status, data as FirebaseErrorPayload);
    }

    return data as T;
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      throw error;
    }
    throw new FirebaseAuthError(
      "Failed to reach Firebase Identity Toolkit",
      502,
      "FIREBASE_UNAVAILABLE"
    );
  }
};

// Secure Token Service へのリクエストを共通化する。
const secureTokenRequest = async <T>(
  env: FirebaseAuthBindings,
  path: string,
  body: URLSearchParams
): Promise<T> => {
  const apiKey = ensureBinding(env.FIREBASE_API_KEY, "FIREBASE_API_KEY");
  const url = new URL(path, secureTokenOrigin(env));
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const text = await response.text();
    const data = (text ? JSON.parse(text) : {}) as T | FirebaseErrorPayload;

    if (!response.ok) {
      throw toAuthError(response.status, data as FirebaseErrorPayload);
    }

    return data as T;
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      throw error;
    }
    throw new FirebaseAuthError(
      "Failed to reach Firebase Secure Token service",
      502,
      "FIREBASE_UNAVAILABLE"
    );
  }
};

const normalizeUser = (raw?: LookupUser): FirebaseAuthUser => {
  if (!raw) {
    throw new FirebaseAuthError("User record not found", 404, "USER_NOT_FOUND");
  }

  let customClaims: Record<string, unknown> | undefined;
  if (raw.customAttributes) {
    try {
      customClaims = JSON.parse(raw.customAttributes) as Record<
        string,
        unknown
      >;
    } catch (error) {
      console.warn(
        "Failed to parse customAttributes for user",
        raw.localId,
        error
      );
    }
  }

  // Firebase のレスポンス形式をアプリ内部のユーザー型に正規化する。
  return {
    uid: raw.localId,
    email: raw.email,
    emailVerified: raw.emailVerified ?? false,
    displayName: raw.displayName,
    photoURL: raw.photoUrl,
    phoneNumber: raw.phoneNumber,
    providerIds:
      raw.providerUserInfo?.map(
        (provider: { providerId: string }) => provider.providerId
      ) ?? [],
    disabled: raw.disabled ?? false,
    metadata: {
      creationTime: raw.createdAt,
      lastSignInTime: raw.lastLoginAt,
    },
    customClaims,
  };
};

export const lookupUserByIdToken = async (
  env: FirebaseAuthBindings,
  idToken: string
): Promise<FirebaseAuthUser> => {
  // `/accounts:lookup` は ID トークンを検証しつつユーザー情報を返す。
  const response = await identityToolkitRequest<LookupResponse>(
    env,
    "/accounts:lookup",
    {
      idToken,
    }
  );
  const user = response.users?.[0];
  return normalizeUser(user);
};

// メールアドレスとパスワードを使ってログインし、トークンとユーザー情報を返す。
export const signInWithPassword = async (
  env: FirebaseAuthBindings,
  email: string,
  password: string
): Promise<SignInResult> => {
  if (!email || !password) {
    throw new FirebaseAuthError(
      "EMAIL_AND_PASSWORD_REQUIRED",
      400,
      "EMAIL_AND_PASSWORD_REQUIRED"
    );
  }

  const result = await identityToolkitRequest<SignInResponse>(
    env,
    "/accounts:signInWithPassword",
    {
      email,
      password,
      returnSecureToken: true,
    }
  );

  const user = await lookupUserByIdToken(env, result.idToken);

  return {
    tokens: normalizeTokenBundle(
      result.idToken,
      result.refreshToken,
      result.expiresIn
    ),
    user,
  };
};

// リフレッシュトークンから新しい ID トークンを発行する。
export const refreshIdToken = async (
  env: FirebaseAuthBindings,
  refreshToken: string
): Promise<RefreshResult> => {
  if (!refreshToken) {
    throw new FirebaseAuthError(
      "MISSING_REFRESH_TOKEN",
      400,
      "MISSING_REFRESH_TOKEN"
    );
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", refreshToken);

  const result = await secureTokenRequest<RefreshResponse>(
    env,
    "/token",
    params
  );
  const user = await lookupUserByIdToken(env, result.id_token);

  return {
    tokens: normalizeTokenBundle(
      result.id_token,
      result.refresh_token,
      result.expires_in
    ),
    user,
  };
};

// 文字列で返る有効期限を number へ変換し、取り扱いやすくする。
const normalizeTokenBundle = (
  idToken: string,
  refreshToken: string,
  expiresIn: string
): TokenBundle => ({
  idToken,
  refreshToken,
  expiresIn: Number.parseInt(expiresIn, 10),
});
