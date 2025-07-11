import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

import { User } from "firebase/auth";

import { UserRecord } from "@/firebase/firebaseDataType/users/userRecord";
import UserData from "@/types/user";
import { raiseError } from "@/errorHandler";

/**
 * 指定されたユーザーIDに基づいてユーザーデータを取得します。
 *
 * @param userId - ユーザーの一意識別子。
 * @returns ユーザーデータが存在する場合はUserオブジェクト、存在しない場合はnull。
 */

const getUserData = async (userinfo: User): Promise<UserData | null> => {
  // ユーザーのメールアドレスが存在する場合は、emailを取得
  if (!userinfo.email) {
    raiseError(
      `ユーザーのメールアドレスが設定されていません: ${userinfo.uid}`,
      "ユーザーデータの取得に失敗しました。メールアドレスが設定されていません。"
    );
    return null;
  }
  try {
    const userDoc = doc(db, "users", userinfo.uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      const userDoc = userSnapshot.data() as UserRecord;

      // UserRecordからUser型に変換
      const user: UserData = {
        uid: userinfo.uid,
        email: userinfo.email,
        emailVerified: userinfo.emailVerified,
        displayName: userDoc.displayName,
        joinGroupId: userDoc.joinGroupId,
      };

      return user;
    } else {
      raiseError(
        `ユーザーデータが見つかりませんでした: ${userinfo.uid}`,
        "ユーザーデータの取得に失敗しました。"
      );
      return null;
    }
  } catch {
    raiseError(
      `ユーザーデータの取得中にエラーが発生しました: ${userinfo.uid}`,
      "ユーザーデータの取得に失敗しました。"
    );
    return null;
  }
};

export default getUserData;
