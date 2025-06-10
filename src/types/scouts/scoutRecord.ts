import { ScoutUnit } from "./scoutUnit";

export interface ScoutRecord {
  /** スカウトの一意識別子 */
  id: string;

  /** スカウトの名前 */
  name: string;

  /** スカウトの所属団 */
  groupId: string;

  /** スカウトの所属隊 */
  unit: ScoutUnit;

  /** スカウトの役割 */
  authedUser: AuthedUser[];
}

interface AuthedUser {
  /** 認証されたユーザーのメールアドレス */
  email: string;

  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
