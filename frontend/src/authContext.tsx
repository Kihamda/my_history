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
import LoadingSplash from "@f/style/loadingSplash";
import { setHcClient, hc } from "@f/lib/api/api";
import type { UserProfile } from "./lib/api/apiTypes";
import { raiseError } from "./errorHandler";
import { getBrowserSettings } from "./lib/localCache";

interface UserProfileContext extends UserProfile {
  currentGroup: UserProfile["auth"]["memberships"][number] | null;
}

interface AuthContextValue {
  user: UserProfileContext | null;
  token: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// AuthProviderコンポーネントの定義
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfileContext | null>(null);
  const [token, setToken] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  //　認証状態の変化を監視
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
      try {
        setHcClient(await getIdToken(fbUser));
        setToken(fbUser);

        // APIからユーザーデータを取得
        const user = await hc.apiv1.user.me.$get();

        if (user.status === 404) {
          setUser(null);
          raiseError("ユーザーデータが見つかりませんでした。");
        } else {
          //　ユーザーデータを状態に保存
          const userData: UserProfile = await user.json();
          const currentGroupSlotId = getBrowserSettings().currentGroupSlotId;
          if (currentGroupSlotId) {
            const currentGroup = userData.auth.memberships.find(
              (membership) => membership.id === currentGroupSlotId
            );
            setUser({
              ...userData,
              currentGroup: currentGroup || null,
            });
          } else {
            setUser({
              ...userData,
              currentGroup: null,
            });
          }
        }
      } catch (e) {
        console.error("Failed to init auth context:", e);
        setUser(null);
        raiseError("ユーザーデータの取得に失敗しました。");
      } finally {
        setIsLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  /// token更新
  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        setHcClient(await getIdToken(auth.currentUser, true));
      }
    }, 10 * 60 * 1000); // 10分ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  } else {
    return (
      <AuthContext.Provider value={{ user, token }}>
        {children}
      </AuthContext.Provider>
    );
  }
};

export const useAuthContext = (): AuthContextValue | null => {
  const context = useContext(AuthContext);
  return context;
};

export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
export const register = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Password reset failed:", error);
  }
};
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      console.error("Verification email sending failed:", error);
    }
  }
};

export default AuthProvider;
