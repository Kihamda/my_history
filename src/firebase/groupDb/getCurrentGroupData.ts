import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { raiseError } from "@/errorHandler";
import { GroupRecord } from "../firebaseDataType/groups/groupRecord";
import CurrentGroup from "@/types/user/currentGroup";
import { GroupMemberRecord } from "../firebaseDataType/groups/groupMemberRecord";

const getCurrentGroupData = async (
  groupId: string
): Promise<CurrentGroup | null> => {
  // ユーザーのjoinGroupIdが存在しない場合は、何もしない
  if (!groupId) {
    return null;
  }

  // リーダーや管理者のフラグを初期化
  let isLeader = false;
  let isAdmin = false;
  let isEditable = false;

  try {
    // グループのドキュメントを取得
    const groupDoc = doc(db, "groups", groupId);
    const groupSnapshot = await getDoc(groupDoc);

    if (groupSnapshot.exists()) {
      const groupData = groupSnapshot.data() as GroupRecord;

      // グループ名を取得
      const groupName = groupData.name;

      //読み込めたときのみ、roleを確認する
      const groupMemberDoc = doc(db, "groups", groupId, "members", groupId);
      const groupMemberSnapshot = await getDoc(groupMemberDoc);

      const groupMemberData = groupMemberSnapshot.data() as GroupMemberRecord;

      // グループ内のroleを判定する
      if (groupMemberData.role === "admin") {
        isAdmin = true;
        isEditable = true; // 管理者はスカウトを編集可能
        isLeader = true; // 管理者はリーダーとしても扱う
      } else if (groupMemberData.role === "edit") {
        isLeader = true;
        isEditable = true; // 編集権限がある場合はスカウトを編集可能
      } else if (groupMemberData.role === "view") {
        isLeader = true; // ビュー権限の場合はリーダーとして検索機能開放だけ
      }

      // 現在のグループ情報を返す
      const currentGroup: CurrentGroup = {
        name: groupName,
        isLeader: isLeader,
        isAdmin: isAdmin,
        isEditable: isEditable,
      };

      return currentGroup;
    } else {
      raiseError(
        `グループデータが見つかりませんでした: ${groupId}`,
        "不明な原因でグループデータの取得に失敗しました。"
      );
      return null;
    }
  } catch {
    // エラーが帰る場合は登録されてない場合が含まれる
    // このときはどこにも所属せず、何の権限も持たないユーザーとして扱う
    // 要するにisLeaderとisAdminはfalseのまま何もしない。
    raiseError(
      `グループデータの取得中にエラーが発生しました: ${groupId}`,
      "グループデータの取得に失敗しました。\n所属グループの設定が間違っている可能性があります。"
    );
    return null;
  }
};

export default getCurrentGroupData;
