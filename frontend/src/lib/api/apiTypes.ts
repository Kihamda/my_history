import { hc, type ReqType, type ResType } from "./api";

// UserProfile型をAPIのレスポンス型から派生させる
export type UserProfile = ResType<typeof hc.apiv1.user.me.$get> & {
  // 追加のプロパティがあればここに定義
};
// スカウト検索
export type ScoutSearchResponse = ResType<typeof hc.apiv1.scout.search.$post>;
export type ScoutSearchRequest = ReqType<
  typeof hc.apiv1.scout.search.$post
>["json"];

// スカウト詳細取得
export type ScoutData = ResType<(typeof hc.apiv1.scout)[":id"]["$get"]>;

// スカウト作成
export type ScoutCreate = ReqType<typeof hc.apiv1.scout.create.$post>["json"];

// スカウト更新
export type ScoutUpdate = ReqType<(typeof hc.apiv1.scout)[":id"]["$put"]>;
