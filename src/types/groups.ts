export interface Group {}

export interface GroupMember {
  // Groupのサブコレクションのメンバとして登録されたユーザー情報を表す型定義

  /** ユーザーの一意識別子 */
  email: string;

  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの役割 */
  role: "admin" | "edit" | "view";
}
