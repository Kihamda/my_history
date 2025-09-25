interface CurrentGroup {
  name: string; // グループ名

  isLeader: boolean; // リーダーかどうかのフラグ。

  isEditable: boolean; // スカウトを編集可能かどうかのフラグ。

  isAdmin: boolean; // 管理者かどうかのフラグ。
}

export default CurrentGroup;
