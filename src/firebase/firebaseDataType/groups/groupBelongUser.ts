// Groupのサブコレクションのメンバとして登録されたユーザー情報を表す型定義

export interface GroupBelongsUser {
  /** ユーザーの一意識別子 */
  mail: string;

  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの役割 */
  role: "admin" | "edit" | "view";
}
