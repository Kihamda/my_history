export interface AuthedUser {
  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
