import { db } from "@/firebase/firebase";
import { UserRecord } from "@/firebase/firebaseDataType/users/userRecord";

import { doc, setDoc } from "firebase/firestore";

import UserData from "@/types/user/user";

import { raiseError } from "@/errorHandler";

/**
 * ユーザーデータをFirestoreに保存します。
 *
 * @param userData - 保存するユーザーデータ。
 * @returns 保存が成功した場合はtrue、失敗した場合はfalse。
 */

const setUserData = async (userData: UserData): Promise<boolean> => {
  try {
    // User型からUserRecord型に変換
    const userRecord: UserRecord = {
      displayName: userData.displayName,
      joinGroupId: userData.joinGroupId,
      knownScoutIds: [], // 新規ユーザーの場合は空配列で初期化
    };

    const userDoc = doc(db, "users", userData.uid);
    await setDoc(userDoc, userRecord);

    return true;
  } catch (error) {
    raiseError(
      `ユーザーデータの保存中にエラーが発生しました: ${userData.uid}`,
      "ユーザーデータの保存に失敗しました。"
    );
    return false;
  }
};

export default setUserData;
