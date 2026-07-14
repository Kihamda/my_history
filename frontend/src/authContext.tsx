/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  verifyBeforeUpdateEmail,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { apiJson, hc, queryClient, setHcClient } from "@f/lib/api/api";
import type { UserProfile } from "./lib/api/apiTypes";
import { raiseError } from "./errorHandler";
import { getBrowserSettings, setBrowserSettings } from "./lib/localCache";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

type UserProfileContext = UserProfile;

interface AuthContextValue {
  user: UserProfileContext | null;
  token: User | null;
  currentGroup: UserProfile["auth"]["memberships"][number] | null;
  setCurrentGroup?: (id: string | null) => Promise<void>;
  refreshUser?: () => Promise<void>;
}

interface SafeAuthContextValue {
  user: UserProfileContext;
  token: User;
  currentGroup: UserProfile["auth"]["memberships"][number] | null;
  setCurrentGroup: (id: string | null) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProviderコンポーネントの定義
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [currentGroup, setCurrentGroupState] = useState<
    UserProfile["auth"]["memberships"][number] | null
  >(null);

  // 認証状態の変化を監視
  // token:null : ログアウト
  // token:email_Verified=false : メール未認証
  // token:email_Verified=true : 通常ログイン済み
  // user:null : ユーザーデータ未取得または存在しない
  // user:UserProfile : ユーザーデータ取得済み
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setToken(null);
        setHcClient();
        queryClient.removeQueries({ queryKey: ["current-user"] });
        setIsAuthLoaded(true);
        return;
      }

      setIsAuthLoaded(false);
      try {
        setHcClient(await getIdToken(fbUser, true));
        queryClient.removeQueries({ queryKey: ["current-user"] });
        setToken(fbUser);
      } catch (e) {
        raiseError("ユーザーデータの取得に失敗しました。", "error", String(e));
      } finally {
        setIsAuthLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const userQuery = useQuery({
    queryKey: ["current-user", token?.uid],
    enabled: !!token && isAuthLoaded,
    queryFn: async (): Promise<UserProfileContext | null> => {
      const response = await hc.apiv1.user.me.$get();
      if (response.status === 404) return null;
      return apiJson(response, "ユーザーデータの取得に失敗しました。");
    },
  });

  const user = userQuery.data ?? null;

  useEffect(() => {
    if (!user) {
      setCurrentGroupState(null);
      return;
    }

    const settings = getBrowserSettings();
    const nextCurrentGroup =
      user.auth.memberships.find(
        (membership) => membership.id === settings.currentGroupSlotId,
      ) ??
      user.auth.memberships[0] ??
      null;

    setCurrentGroupState(nextCurrentGroup);
    setBrowserSettings({
      ...settings,
      currentGroupSlotId: nextCurrentGroup?.id ?? null,
    });
  }, [user]);

  /// 自動token更新
  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (auth.currentUser) {
          const newToken = await getIdToken(auth.currentUser);
          setHcClient(newToken);
        }
      },
      10 * 60 * 1000,
    ); // 10分ごとに更新
    return () => clearInterval(interval);
  }, []);

  // 現在のユーザー情報を再取得して更新する関数
  const setCurrentGroup = async (id: string | null) => {
    if (!token) return;
    if (id === null) {
      setCurrentGroupState(null);
      setBrowserSettings({
        ...getBrowserSettings(),
        currentGroupSlotId: null,
      });
      raiseError("グループを未選択にしました。", "success");
      return;
    }
    try {
      if (!user) return;
      const selectedGroup =
        user.auth.memberships.find(
          (membership: UserProfile["auth"]["memberships"][number]) =>
            membership.id === id,
        ) || null;
      if (!selectedGroup) {
        setCurrentGroupState(null);
        setBrowserSettings({
          ...getBrowserSettings(),
          currentGroupSlotId: null,
        });
        raiseError("指定されたグループが見つかりません。");
        return;
      }

      setCurrentGroupState(selectedGroup);
      setBrowserSettings({
        ...getBrowserSettings(),
        currentGroupSlotId: selectedGroup.id,
      });
      raiseError(
        "グループを切り替えました。",
        "success",
        `Selected Group ID: ${id}`,
      );
    } catch (e) {
      raiseError("グループの切り替えに失敗しました。", "error", String(e));
    }
  };

  const refreshUser = async () => {
    await userQuery.refetch();
  };

  if (!isAuthLoaded || (!!token && userQuery.isPending)) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  } else {
    return (
      <AuthContext.Provider
        value={{ user, token, currentGroup, setCurrentGroup, refreshUser }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
};
export function useAuthContext(safe?: true): SafeAuthContextValue;
export function useAuthContext(safe: false): AuthContextValue;
export function useAuthContext(
  safe = true,
): AuthContextValue | SafeAuthContextValue {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  if (safe) {
    if (!context.user || !context.token) {
      navigate("/auth/login");
      throw new Error("AuthContext user or token is null");
    }
  }
  return context;
}

export function useCurrentGroup() {
  const context = useAuthContext();
  if (!context.currentGroup) {
    raiseError("所属グループが設定されていません。");
    throw new Error("Current group is not set");
  } else {
    return context.currentGroup;
  }
}

export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    raiseError("ログインしました", "success");
    return true;
  } catch (error) {
    raiseError("ログインに失敗しました", "error", String(error));
    return false;
  }
};
export const logout = async () => {
  try {
    await signOut(auth);
    raiseError("ログアウトしました", "success");
    return true;
  } catch (error) {
    raiseError("ログアウトに失敗しました", "error", String(error));
    return false;
  }
};
export const register = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    raiseError("登録が完了しました", "success");
    return true;
  } catch (error) {
    raiseError("登録に失敗しました", "error", String(error));
    return false;
  }
};
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    raiseError("パスワードリセットメールを送信しました", "success");
    return true;
  } catch (error) {
    raiseError("パスワードリセットに失敗しました", "error", String(error));
    return false;
  }
};
export const updateEmail = async (email: string) => {
  if (auth.currentUser) {
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, email);
      raiseError(
        "メールアドレスを更新しました。確認メールを送信しました。",
        "success",
      );
      return true;
    } catch (error) {
      raiseError("メールアドレスの更新に失敗しました", "error", String(error));
      return false;
    }
  }
  raiseError("ログイン中のユーザーが見つかりません。");
  return false;
};
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      raiseError("確認メールを送信しました", "success");
      return true;
    } catch (error) {
      raiseError("確認メールの送信に失敗しました", "error", String(error));
      return false;
    }
  }
  raiseError("ログイン中のユーザーが見つかりません。");
  return false;
};

export default AuthProvider;
