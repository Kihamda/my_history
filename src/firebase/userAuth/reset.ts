import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

/**
 * 指定されたメールアドレス宛にパスワードリセットのリンクを送信します。
 *
 * @param email - パスワードリセットメールを送りたいユーザーのメールアドレス。
 * @returns リセットメール送信完了を表すPromise。
 * @throws メール送信に失敗した場合にエラーをスローします。
 */
const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);

    console.log("Password reset email sent successfully.");
    alert("パスワードリセットメールを送信しました。メールを確認してください。");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export default resetPassword;
