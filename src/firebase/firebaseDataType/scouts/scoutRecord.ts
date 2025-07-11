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

  /** スカウトに関するコメント */
  comment: string;

  /**ちかい */
  declare: {
    /** ちかいを立てた日 */
    date: Date;

    /** ちかいを立てた場所 */
    place: string;
  };

  /** スカウトの履歴 */
  history: {
    [key: string]: {
      /** スカウトがそのユニットに参加したかどうか */
      was: boolean;

      /** スカウトがそのユニットに参加した日 */
      joinedAt: Date;

      /** スカウトがそのユニットを卒業した日 */
      graduatedAt?: Date;
    };
  };
}

interface AuthedUser {
  /** 認証されたユーザーのメールアドレス */
  email: string;

  /** 認証されたユーザーの表示名 */
  displayName?: string;

  role: "edit" | "view";
}
