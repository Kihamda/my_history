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
import { userData } from "./userAuth/usertype";

interface AuthContextProps {
  user: User | null;
  userData: userData | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<userData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserData(userDoc.data() as userData);
        //firestoreから取ってきたデータをuserDataとしてセット
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userData };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
