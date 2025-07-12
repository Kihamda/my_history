interface User {
  /** ユーザーのID */
  uid: string;

  /** ユーザーのメールアドレス */
  email: string;

  /** ユーザーのメールアドレス確認状態 */
  emailVerified: boolean;

  isLeader: boolean; // リーダーかどうかのフラグ。オプションとして定義

  isAdmin: boolean; // 管理者かどうかのフラグ。オプションとして定義

  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの参加グループID */
  joinGroupId: string;
}

export default User;
