import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

/**
 * 指定されたメールアドレスとパスワードで新しいユーザーを作成し、ユーザー情報をFirestoreデータベースに保存します。
 *
 * @param email - 新しいユーザーのメールアドレス。
 * @param password - 新しいユーザーのパスワード。
 * @returns 作成されたユーザーに解決されるPromise。
 * @throws ユーザー作成に失敗した場合にエラーをスローします。
 */
const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await sendEmailVerification(user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export default createUser;
