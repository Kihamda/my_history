import { db, app } from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * 指定されたメールアドレスとパスワードで新しいユーザーを作成し、ユーザー情報をFirestoreデータベースに保存します。
 *
 * @param email - 新しいユーザーのメールアドレス。
 * @param password - 新しいユーザーのパスワード。
 * @returns 作成されたユーザーに解決されるPromise。
 * @throws ユーザー作成に失敗した場合にエラーをスローします。
 */
const createUser = async (email: string, password: string) => {
  const auth = getAuth(app);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export default createUser;
