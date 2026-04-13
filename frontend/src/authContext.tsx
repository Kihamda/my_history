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
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import LoadingSplash from "@f/lib/style/loadingSplash";
import { setHcClient, hc } from "@f/lib/api/api";
import type { UserProfile } from "./lib/api/apiTypes";
import { raiseError } from "./errorHandler";
import { getBrowserSettings } from "./lib/localCache";

interface UserProfileContext extends UserProfile {}

interface AuthContextValue {
  user: UserProfileContext | null;
  token: User | null;
  currentGroup: UserProfile["auth"]["memberships"][number] | null;
  setCurrentGroup?: (id: string | null) => Promise<void>;
}

interface SafeAuthContextValue {
  user: UserProfileContext;
  token: User;
  currentGroup: UserProfile["auth"]["memberships"][number] | null;
  setCurrentGroup: (id: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProviderコンポーネントの定義
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfileContext | null>(null);
  const [token, setToken] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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
        setUser(null);
        setToken(null);
        setHcClient();
        setIsLoaded(true);
        return;
      }

      // Firebaseユーザーが存在する場合、IDトークンを取得してAPIクライアントに設定し、ユーザーデータを取得
      setIsLoaded(false);
      try {
        setHcClient(await getIdToken(fbUser, true));
        setToken(fbUser);

        // APIからユーザーデータを取得
        const user = await hc.apiv1.user.me.$get();

        if (user.status === 404) {
          setUser(null);
          raiseError("ユーザーデータが見つかりませんでした。");
        } else if (!user.ok) {
          setUser(null);
          raiseError(
            "ユーザーデータの取得に失敗しました。",
            "error",
            (await user.json()).message,
          );
        } else {
          // ユーザーデータを状態に保存
          const userData: UserProfile = await user.json();
          if (userData.auth.memberships.length < 0) {
            setCurrentGroupState(null);
          } else {
            const setedCurrentGroupIndex = userData.auth.memberships.findIndex(
              (membership) =>
                membership.id === getBrowserSettings().currentGroupSlotId,
            );
            const currentGroupIndex =
              setedCurrentGroupIndex !== -1 ? setedCurrentGroupIndex : 0;
            const currentGroup = userData.auth.memberships[currentGroupIndex];
            setUser(userData);
            setCurrentGroupState(currentGroup);
          }
        }
      } catch (e) {
        setUser(null);
        raiseError("ユーザーデータの取得に失敗しました。", "error", String(e));
      } finally {
        setIsLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

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
      raiseError("グループを未選択にしました。", "success");
      return;
    }
    try {
      setCurrentGroupState(() => {
        if (!user) return null;
        return (
          user.auth.memberships.find(
            (membership: UserProfile["auth"]["memberships"][number]) =>
              membership.id === id,
          ) || null
        );
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

  if (!isLoaded) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  } else {
    return (
      <AuthContext.Provider
        value={{ user, token, currentGroup, setCurrentGroup }}
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
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  if (safe) {
    if (!context.user || !context.token) {
      window.location.href = "/auth/login";
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
  } catch (error) {
    raiseError("Login failed:", "error", String(error));
  }
};
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    raiseError("Logout failed:", "error", String(error));
  }
};
export const register = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    raiseError("Registration failed:", "error", String(error));
  }
};
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    raiseError("Password reset failed:", "error", String(error));
  }
};
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      raiseError("Verification email sending failed:", "error", String(error));
    }
  }
};

export default AuthProvider;
