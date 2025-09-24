import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// ユーザーをログインさせる関数
const login = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User logged in successfully:", userCredential.user);
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

// ユーザーをログアウトさせる関数
const logout = async (): Promise<void> => {
  try {
    await auth.signOut();
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export { login, logout };
