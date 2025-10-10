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
} from "firebase/auth";
import { auth } from "./firebase";
import LoadingSplash from "@/style/loadingSplash";

import { type UserProfile } from "b@/types/api/user"; // ユーザーデータの型をインポート
import { createClient, type ClientType } from "b@/client";

interface AuthContextValue {
  user: UserProfile | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export let hc: ClientType | null = null; // APIクライアントを格納する変数

// AuthProviderコンポーネントの定義
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        hc = null;
        setIsLoaded(true);
        return;
      }
      try {
        hc = createClient(
          import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787",
          await getIdToken(auth.currentUser!, true)
        );

        const user = await hc.api.user.$get(); // APIからユーザーデータを取得

        if (user.status === 404) {
          setUser(null);
        } else {
          const userData: UserProfile = await user.json();
          setUser(userData);
        }
      } catch (e) {
        console.error("Failed to init auth context:", e);
        setUser(null);
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
        hc = createClient(
          import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787",
          await getIdToken(auth.currentUser, true)
        );
      }
    }, 10 * 60 * 1000); // 10分ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  } else {
    return (
      <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
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
