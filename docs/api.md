# API 仕様

## 認証

- すべての `/apiv1/*` は Firebase ID トークンが必須
- `Authorization: Bearer <token>` を付与
- メール認証済みのトークンのみ許可

## User API

ベースパス: `/apiv1/user`

| メソッド | パス             | 説明                     |
| -------- | ---------------- | ------------------------ |
| POST     | `/createUser`    | Firestore のユーザー作成 |
| GET      | `/me`            | 自分のプロファイル取得   |
| POST     | `/lookupByEmail` | メール検索               |
| POST     | `/acceptInvite`  | 招待受諾                 |
| POST     | `/updateProfile` | プロファイル更新         |
| DELETE   | `/delete`        | ユーザー削除             |

### プロファイル

```ts
{
  uid: string;
  email: string;
  profile: {
    displayName: string;
    statusMessage: string;
  }
  auth: {
    emailVerified: boolean;
    memberships: {
      id: string;
      name: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }
    [];
    invites: {
      id: string;
      name: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }
    [];
    shares: {
      id: string;
      role: "EDIT" | "VIEW";
    }
    [];
    isGod: boolean;
  }
}
```

## Scout API

ベースパス: `/apiv1/scout`

| メソッド | パス            | 説明         | 権限                          |
| -------- | --------------- | ------------ | ----------------------------- |
| POST     | `/search`       | 検索         | グループメンバー              |
| POST     | `/create`       | 作成         | グループ EDIT 以上            |
| GET      | `/:id`          | 取得         | グループメンバー または share |
| PUT      | `/:id`          | 更新         | グループ EDIT 以上            |
| DELETE   | `/:id`          | 削除         | グループ ADMIN                |
| POST     | `/:id/transfer` | グループ移動 | グループ ADMIN                |

### 検索リクエスト

```ts
{
  name: string;
  scoutId: string;
  currentUnit: Array<"bvs" | "cs" | "bs" | "vs" | "rs" | "ob">;
  page: number;
  belongGroupId: string;
}
```

### 作成リクエスト

```ts
{
  name: string;
  scoutId: string;
  birthDate: string; // YYYY-MM-DD
  belongGroupId: string;
}
```

### 更新リクエスト

```ts
{
  data: ScoutRecord; // belongGroupId を除く
}
```

## Group API

ベースパス: `/apiv1/group`

| メソッド | パス                     | 説明         | 権限  |
| -------- | ------------------------ | ------------ | ----- |
| GET      | `/:id`                   | メンバー一覧 | ADMIN |
| POST     | `/:id/invites/create`    | 招待追加     | ADMIN |
| GET      | `/:id/members`           | メンバー一覧 | ADMIN |
| DELETE   | `/:id/members/:uid`      | メンバー削除 | ADMIN |
| PUT      | `/:id/members/:uid/role` | ロール更新   | ADMIN |

### メンバー取得レスポンス

```ts
{
  uid: string;
  role: "ADMIN" | "EDIT" | "VIEW";
  email: string;
  displayName: string;
  statusMessage: string;
}
[];
```

## God API

ベースパス: `/apiv1/god`

`auth.isGod` が true のユーザーのみ利用可能

### Scout

| メソッド | パス                  | 説明                         |
| -------- | --------------------- | ---------------------------- |
| GET      | `/scout/getScoutData` | doc_id または scoutId で取得 |
| POST     | `/scout/setScoutData` | doc_id 指定で上書き          |

### Group

| メソッド | パス                         | 説明         |
| -------- | ---------------------------- | ------------ |
| GET      | `/group/:id/getGroupData`    | グループ取得 |
| POST     | `/group/createGroupData`     | グループ作成 |
| DELETE   | `/group/:id/deleteGroupData` | グループ削除 |
| POST     | `/group/:id/setGroupData`    | グループ更新 |
