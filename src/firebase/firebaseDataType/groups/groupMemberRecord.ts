// Groupのサブコレクションのメンバとして登録されたユーザー情報を表す型定義
// データ本体に一意識別子は入れない（ケチ）

export interface GroupMemberRecord {
  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの役割 */
  role: "admin" | "edit" | "view";
}
