export interface UserRecord {
  /** ユーザーの表示名 */
  displayName: string;

  /** ユーザーの参加グループID */
  joinGroupId: string;

  /** ユーザーのリーダーシップフラグ */
  isLeader: boolean;

  /** ユーザーが知っているスカウトのIDのリスト */
  knownScoutIds: string[];
}

/**
 * joinGroupIdはあくまで参照用、実際の閲覧可否はemailとverifiedがGroupの方に合致するかで決定する
 */
