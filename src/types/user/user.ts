import CurrentGroup from "@/types/user/currentGroup";

interface User {
  /** ユーザーのID */
  uid: string;

  /** ユーザーのメールアドレス */
  email: string;

  /** ユーザーのメールアドレス確認状態 */
  emailVerified: boolean;

  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの参加グループID */
  joinGroupId: string;

  /** ユーザーの現在のグループ情報 */
  currentGroup: CurrentGroup | null;
}

export default User;
