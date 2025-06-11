export interface UserRecord {
  /** ユーザーの一意識別子 */
  uid: string;

  /** ユーザーのメールアドレス */
  email: string;

  /** ユーザーの表示名 */
  displayName?: string;

  /** ユーザーの参加グループID */
  joinGroupId: string;

  /** 初期化の完了フラグ */
  inited: boolean;

  /** ユーザーが知っているスカウトのIDのリスト */
  knownScoutIds: string[];
}

/**
 * joinGroupIdはあくまで参照用、実際の閲覧可否はemailとverifiedがGroupの方に合致するかで決定する
 */
