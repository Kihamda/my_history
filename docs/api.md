# API 仕様

最終更新：2026-08-14

API の基準パスは `/apiv1` です。
現在のルート定義には、API ルート自身を含めて 39 エンドポイントがあります。

## 共通認証

すべての API は `Authorization: Bearer <Firebase ID token>` を要求します。
トークンがない場合または検証できない場合は `401`、メール未確認の場合は `403` を返します。

`POST /user/createUser` は Firebase Authentication の利用者に対応する User ドキュメントを作るため、既存の User ドキュメントを要求しません。
それ以外の User、Scout、Group、God API は User ドキュメントを読み込んでから処理します。

通常のエラーは次の形式です。

```json
{ "message": "エラー内容" }
```

## API ルート

| メソッド | パス | 説明 | 追加条件 |
| --- | --- | --- | --- |
| GET | `/apiv1/` | API の案内 | なし |

## User API

| メソッド | パス | 説明 | 追加条件 |
| --- | --- | --- | --- |
| POST | `/apiv1/user/createUser` | User ドキュメント作成 | User ドキュメント未作成 |
| GET | `/apiv1/user/me` | 自分のプロフィール、所属、招待、共有を取得 | なし |
| POST | `/apiv1/user/lookupByEmail` | 招待を受け付ける利用者をメールで検索 | なし |
| GET | `/apiv1/user/sharedScouts` | 共有されたスカウトを取得 | `offset`、20 件単位 |
| POST | `/apiv1/user/updateProfile` | 自分のプロフィールを更新 | なし |
| DELETE | `/apiv1/user/delete` | 自分の User ドキュメントを削除 | 各所属に別の ADMIN が必要 |
| POST | `/apiv1/user/auth/acceptInvite/:groupCode` | 招待を受諾 | 対応する招待が必要 |
| POST | `/apiv1/user/auth/denyInvite/:groupCode` | 招待を拒否 | 対応する招待が必要 |
| POST | `/apiv1/user/auth/leaveGroup/:groupId` | グループから脱退 | 最後の ADMIN は不可 |
| POST | `/apiv1/user/auth/leaveSharedBy/:sharedById` | スカウト共有を解除 | 対応する共有が必要 |

作成とプロフィール更新の JSON は同じ構造です。

```ts
{
  displayName: string;
  statusMessage: string;
  acceptsInvite: boolean;
}
```

`lookupByEmail` は `{ email: string }` を受け取ります。

## Scout API

| メソッド | パス | 説明 | 追加条件 |
| --- | --- | --- | --- |
| POST | `/apiv1/scout/search` | 所属グループ内を検索 | そのグループのメンバー |
| POST | `/apiv1/scout/create` | スカウト作成 | 対象グループの ADMIN または EDIT |
| GET | `/apiv1/scout/:id` | スカウト取得 | 所属グループのメンバーまたは共有先 |
| PUT | `/apiv1/scout/:id` | スカウト全体を更新 | 所属グループの ADMIN、EDIT または共有 EDIT |
| DELETE | `/apiv1/scout/:id` | スカウト削除 | 所属グループの ADMIN |
| POST | `/apiv1/scout/:id/transfer` | 所属グループを変更 | 移管元の ADMIN、移管先が受入許可 |
| POST | `/apiv1/scout/:id/share` | VIEW 共有を追加 | 所属グループの ADMIN または EDIT、グループが共有許可 |
| DELETE | `/apiv1/scout/:id/share` | 共有を削除 | 所属グループの ADMIN または EDIT |
| GET | `/apiv1/scout/:id/share` | 共有先一覧を取得 | 所属グループの ADMIN または EDIT |

検索リクエストは次の構造です。

```ts
{
  name?: string;
  scoutId?: string;
  currentUnit?: ("bvs" | "cs" | "bs" | "vs" | "rs" | "ob")[];
  page?: number;
  belongGroupId: string;
}
```

1 ページは 20 件です。
名前は前方一致、登録番号は完全一致で検索します。

作成リクエストは次の構造です。

```ts
{
  name: string;
  scoutId: string;       // 9 文字以上 12 文字以下の数字
  birthDate: string;     // YYYY-MM-DD、空文字は不可
  belongGroupId: string;
}
```

同じグループ内に同じ登録番号がある場合は `409` を返します。
更新は `{ data: ScoutRecordWithoutBelongGroupId }` を受け取り、部分更新ではなくレコード全体を置き換えます。
共有の追加と削除は `{ targetUserId: string }`、移管は `{ targetGroupId: string }` を受け取ります。

## Group API

| メソッド | パス | 説明 | 追加条件 |
| --- | --- | --- | --- |
| GET | `/apiv1/group/:id/profile` | グループの利用者向け設定を取得 | 認証済み User |
| POST | `/apiv1/group/:id/profile` | グループの利用者向け設定を更新 | 対象グループの ADMIN |
| POST | `/apiv1/group/:id/invites/create` | 利用者を招待 | 対象グループの ADMIN |
| GET | `/apiv1/group/:id/invites` | 招待中の利用者を取得 | 対象グループの ADMIN、20 件単位 |
| GET | `/apiv1/group/:id/members` | メンバーを取得 | 対象グループの ADMIN、20 件単位 |
| DELETE | `/apiv1/group/:id/members/:uid` | メンバーを削除 | 対象グループの ADMIN、自分自身は不可 |
| PUT | `/apiv1/group/:id/members/:uid/role` | メンバーのロールを変更 | 対象グループの ADMIN、自分自身は不可 |

グループ設定の更新は次の全項目を受け取ります。

```ts
{
  allowSendScout: boolean;
  allowShare: boolean;
  name: string;
}
```

招待作成はメールアドレスではなく、先に `lookupByEmail` で得た利用者 ID を使います。

```ts
{
  targetUid: string;
  role: "ADMIN" | "EDIT" | "VIEW";
}
```

## God API

God API は `auth.isGod` が `true` の利用者だけが使えます。
通常のグループ認可を通さず、三コレクションを直接検索、置換、削除できます。

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | `/apiv1/god/` | 開発環境かどうかを取得 |
| GET | `/apiv1/god/scout/getScoutData` | スカウト検索 |
| POST | `/apiv1/god/scout/batchSetScoutData` | スカウト一括登録または置換 |
| POST | `/apiv1/god/scout/:id/setScoutData` | スカウト置換 |
| DELETE | `/apiv1/god/scout/:id/deleteScoutData` | スカウト削除 |
| GET | `/apiv1/god/group/getAllGroups` | 全グループを 50 件単位で取得 |
| GET | `/apiv1/god/group/:id/getGroupData` | グループ取得 |
| POST | `/apiv1/god/group/:id/setGroupData` | グループ置換 |
| DELETE | `/apiv1/god/group/:id/deleteGroupData` | グループ削除 |
| GET | `/apiv1/god/user/getUserData` | User 検索 |
| POST | `/apiv1/god/user/:id/setUserData` | User 置換 |
| DELETE | `/apiv1/god/user/:id/deleteUserData` | User 削除 |

一括登録は `{ id?: string, data: ScoutRecord }[]` を受け取ります。
