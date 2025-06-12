import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserRecord } from "@/types/users/userRecord";
import LoadingSplash from "@/style/loadingSplash";

/**
 * AuthContextProps は認証状態とユーザーデータを保持するための型です。
 */
interface AuthContextProps {
  user: User | null;
  userData: UserRecord | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (users) => {
      setUser(users);
      if (users) {
        try {
          // Firestore のドキュメントからユーザーデータを取得しています
          const userDoc = await getDoc(doc(db, "users", users.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserRecord);
          } else {
            console.error("No user data found for user:", users.uid);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
        setIsLoaded(true);
      } else {
        setUserData(null);
        setIsLoaded(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userData };

  if (!isLoaded) {
    return <LoadingSplash />;
  } else {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
