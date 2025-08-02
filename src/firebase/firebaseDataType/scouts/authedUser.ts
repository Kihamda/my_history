export interface AuthedUserRecord {
  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
