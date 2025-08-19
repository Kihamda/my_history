import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import LoadingSplash from "@/style/loadingSplash";

import User from "@/types/user/user"; // ユーザーデータの型をインポート
import getUserData from "./userData/getUserData";
import getCurrentGroupData from "./groupDb/getCurrentGroupData";

const AuthContext = createContext<User | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (users) => {
      if (!users) {
        setUser(null);
        setIsLoaded(true);
        return;
      }
      const userData = await getUserData(users);

      // ユーザーデータのnullチェック
      if (userData) {
        const currentGroup = await getCurrentGroupData(userData);
        setUser({ ...userData, currentGroup: currentGroup });
      } else {
        // userDataがnullならUserDataはnullである。
        setUser(null);
      }

      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isLoaded) {
    return <LoadingSplash message="ユーザー情報を読み込み中..." />;
  } else {
    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
  }
};

export const useAuthContext = (): User | null => {
  const context = useContext(AuthContext);
  return context;
};
