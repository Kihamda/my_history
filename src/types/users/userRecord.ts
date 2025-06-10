export interface UserRecord {
  /** ユーザーの一意識別子 */
  uid: string;

  /** ユーザーのメールアドレス */
  email: string;

  /** ユーザーの表示名 */
  displayName?: string;
}
