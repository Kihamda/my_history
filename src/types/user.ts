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
}

export default User;
