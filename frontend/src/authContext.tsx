import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import LoadingSplash from "@/style/loadingSplash";
import type { TokenBundle, FirebaseAuthUser } from "b@/src/firebase";
import type { CurrentGroupContext } from "b@/src/types/domain/group";
import type {
  UserPreferences,
  UserSettingsResponse,
} from "b@/src/types/domain/user";
import { authApi, honoClient, setAuthToken } from "./api";

const SESSION_STORAGE_KEY = "my-history/auth-session";

type AuthProviderProps = {
  children: ReactNode;
};

interface StoredSession {
  tokens?: TokenBundle;
}

interface UserProfileResponse {
  user: FirebaseAuthUser;
  settings: UserSettingsResponse;
  currentGroup: CurrentGroupContext | null;
}

interface RefreshResponse {
  tokens: TokenBundle;
}

export interface AuthContextUser extends FirebaseAuthUser {
  joinGroupId: string | null;
  knownScoutIds: string[];
  preferences: UserPreferences;
  currentGroup: CurrentGroupContext | null;
  settings: UserSettingsResponse;
}

interface AuthContextValue {
  user: AuthContextUser | null;
  tokens: TokenBundle | null;
  isLoading: boolean;
  startSession: (tokens: TokenBundle) => void;
  reload: () => Promise<void>;
  signOut: () => void;
}

const readStoredTokens = (): TokenBundle | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.tokens?.idToken || !parsed.tokens.refreshToken) {
      return null;
    }

    return parsed.tokens;
  } catch (error) {
    console.warn("[Auth] failed to read stored tokens", error);
    return null;
  }
};

const persistTokens = (tokens: TokenBundle | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!tokens) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ tokens }));
};

const mapProfileToUser = ({
  user,
  settings,
  currentGroup,
}: UserProfileResponse): AuthContextUser => {
  const preferences: UserPreferences = settings.preferences ?? {};

  return {
    ...user,
    displayName: settings.displayName ?? user.displayName,
    photoURL: settings.photoURL ?? user.photoURL,
    joinGroupId: settings.joinGroupId ?? null,
    knownScoutIds: settings.knownScoutIds,
    preferences,
    currentGroup,
    settings: {
      ...settings,
      preferences,
    },
    customClaims: user.customClaims ?? {},
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<TokenBundle | null>(() =>
    readStoredTokens()
  );
  const [user, setUser] = useState<AuthContextUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyTokens = useCallback((bundle: TokenBundle | null) => {
    persistTokens(bundle);
    setTokens(bundle);
    if (!bundle) {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const requestRefresh = useCallback(async (refreshToken: string) => {
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await honoClient.api.auth.refresh.$post({
        json: { refreshToken },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as RefreshResponse;
      return payload.tokens;
    } catch (error) {
      console.error("[Auth] token refresh failed", error);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(
    async (
      bundle: TokenBundle
    ): Promise<{
      profile: UserProfileResponse;
      tokens: TokenBundle;
    } | null> => {
      try {
        setAuthToken(bundle.idToken);
        const response = await authApi.api.users.me.$get();

        if (response.ok) {
          const profile = (await response.json()) as UserProfileResponse;
          return { profile, tokens: bundle };
        }

        if (response.status === 401) {
          const refreshed = await requestRefresh(bundle.refreshToken);
          if (!refreshed) {
            return null;
          }

          setAuthToken(refreshed.idToken);
          const retry = await authApi.api.users.me.$get();
          if (!retry.ok) {
            return null;
          }

          const profile = (await retry.json()) as UserProfileResponse;
          return { profile, tokens: refreshed };
        }

        return null;
      } catch (error) {
        console.error("[Auth] failed to load profile", error);
        return null;
      }
    },
    [requestRefresh]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!tokens) {
        applyTokens(null);
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const result = await fetchProfile(tokens);
      if (cancelled) {
        return;
      }

      if (!result) {
        applyTokens(null);
        setIsLoading(false);
        return;
      }

      setUser(mapProfileToUser(result.profile));

      if (result.tokens.idToken !== tokens.idToken) {
        persistTokens(result.tokens);
        setTokens(result.tokens);
      } else {
        setIsLoading(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [tokens, fetchProfile, applyTokens]);

  const startSession = useCallback(
    (bundle: TokenBundle) => {
      setIsLoading(true);
      applyTokens(bundle);
    },
    [applyTokens]
  );

  const signOut = useCallback(() => {
    applyTokens(null);
    setIsLoading(false);
  }, [applyTokens]);

  const reload = useCallback(async () => {
    if (!tokens) {
      return;
    }

    setIsLoading(true);
    const result = await fetchProfile(tokens);

    if (!result) {
      signOut();
      return;
    }

    setUser(mapProfileToUser(result.profile));
    if (result.tokens.idToken !== tokens.idToken) {
      applyTokens(result.tokens);
    } else {
      setIsLoading(false);
    }
  }, [tokens, fetchProfile, applyTokens, signOut]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isLoading,
      startSession,
      reload,
      signOut,
    }),
    [user, tokens, isLoading, startSession, reload, signOut]
  );

  if (isLoading) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthSession = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthProvider");
  }
  return context;
};

export const useAuthContext = (): AuthContextUser | null => {
  const context = useContext(AuthContext);
  return context?.user ?? null;
};

export default AuthProvider;
