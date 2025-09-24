/**
 * 団の基本情報を表す型定義
 * membersコレクションのドキュメントは、団のメンバー情報を含む。(groupMemberRecord.ts)
 */
export interface GroupRecord {
  /** 団名 */
  name: string;

  /** 活動状態 */
  status: "active" | "inactive" | "suspended";
}
