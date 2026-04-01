# API 仕様

## 認証

- すべての `/apiv1/*` は Firebase ID トークンが必須
- `Authorization: Bearer <token>` を付与
- メール認証済みのトークンのみ許可 (`email_verified: true`)
- 未認証: 401、メール未認証: 403 (`EMAIL_VERIFY_MISSING`)

## User API

ベースパス: `/apiv1/user`

| メソッド | パス                          | 説明                       | 認証後 loadUserData |
| -------- | ----------------------------- | -------------------------- | ------------------- |
| POST     | `/createUser`                 | Firestore のユーザー作成   | 不要                |
| GET      | `/me`                         | 自分のプロファイル取得     | 必要                |
| POST     | `/lookupByEmail`              | メールでユーザー検索       | 不要                |
| GET      | `/sharedScouts`               | 共有されたスカウト一覧     | 必要                |
| POST     | `/updateProfile`              | プロファイル更新           | 必要                |
| DELETE   | `/delete`                     | ユーザー削除               | 必要                |
| POST     | `/auth/acceptInvite/:groupCode` | 招待受諾                 | 必要                |
| POST     | `/auth/denyInvite/:groupCode`   | 招待拒否                 | 必要                |
| POST     | `/auth/leaveGroup/:groupId`     | グループ脱退             | 必要                |
| POST     | `/auth/leaveSharedBy/:sharedById` | 共有解除               | 必要                |

### プロファイル (GET /me レスポンス)

```ts
{
  uid: string;
  email: string;
  profile: {
    displayName: string;
    statusMessage: string;
  };
  auth: {
    memberships: {
      id: string;
      name: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }[];
    invites: {
      id: string;
      name: string;
      role: "ADMIN" | "EDIT" | "VIEW";
    }[];
    shares: {
      id: string;
      name: string;
      role: "EDIT" | "VIEW";
    }[];
    acceptsInvite: boolean;
    isGod: boolean;
  };
}
```

## Scout API

ベースパス: `/apiv1/scout`

| メソッド | パス            | 説明           | 権限                                 |
| -------- | --------------- | -------------- | ------------------------------------ |
| POST     | `/search`       | 検索           | グループメンバー                     |
| POST     | `/create`       | 作成           | グループ ADMIN または EDIT           |
| GET      | `/:id`          | 取得           | グループメンバー または share        |
| PUT      | `/:id`          | 更新           | グループ EDIT 以上 または share EDIT |
| DELETE   | `/:id`          | 削除           | グループ ADMIN                       |
| POST     | `/:id/transfer` | グループ移動   | グループ ADMIN                       |
| POST     | `/:id/share`    | 共有追加       | グループ EDIT 以上                   |
| DELETE   | `/:id/share`    | 共有削除       | グループ EDIT 以上                   |
| GET      | `/:id/share`    | 共有者一覧     | グループ EDIT 以上                   |

### 検索リクエスト (POST /search)

```ts
{
  name?: string;           // 部分一致
  scoutId?: string;        // 完全一致
  currentUnit?: ("bvs" | "cs" | "bs" | "vs" | "rs" | "ob")[];
  page: number;            // 1-indexed
  belongGroupId: string;   // 必須
}
```

### 作成リクエスト (POST /create)

```ts
{
  name: string;
  scoutId: string;
  birthDate: string;        // YYYY-MM-DD または空文字
  belongGroupId: string;
}
```

### 更新リクエスト (PUT /:id)

```ts
{
  data: ScoutRecord;        // belongGroupId を除く
}
```

## Group API

ベースパス: `/apiv1/group`

| メソッド | パス                     | 説明           | 権限  |
| -------- | ------------------------ | -------------- | ----- |
| GET      | `/:id/profile`           | グループ情報   | メンバー |
| POST     | `/:id/invites/create`    | 招待追加       | ADMIN |
| GET      | `/:id/invites`           | 招待一覧       | ADMIN |
| GET      | `/:id/members`           | メンバー一覧   | ADMIN |
| DELETE   | `/:id/members/:uid`      | メンバー削除   | ADMIN |
| PUT      | `/:id/members/:uid/role` | ロール更新     | ADMIN |

### メンバー取得レスポンス

```ts
{
  uid: string;
  role: "ADMIN" | "EDIT" | "VIEW";
  email: string;
  displayName: string;
  statusMessage: string;
}[]
```

### 招待作成リクエスト

```ts
{
  email: string;           // RFC 5322
  role: "ADMIN" | "EDIT" | "VIEW";
}
```

## God API

ベースパス: `/apiv1/god`

`auth.isGod === true` のユーザーのみ利用可能

### Index

| メソッド | パス | 説明         |
| -------- | ---- | ------------ |
| GET      | `/`  | 環境情報取得 |

### Scout

| メソッド | パス                      | 説明               |
| -------- | ------------------------- | ------------------ |
| GET      | `/scout/getScoutData`     | スカウト検索       |
| POST     | `/scout/:id/setScoutData` | スカウト作成/更新  |
| DELETE   | `/scout/:id/deleteScoutData` | スカウト削除    |

### Group

| メソッド | パス                          | 説明           |
| -------- | ----------------------------- | -------------- |
| GET      | `/group/getAllGroups`         | 全グループ一覧 |
| GET      | `/group/:id/getGroupData`     | グループ取得   |
| POST     | `/group/:id/setGroupData`     | グループ更新   |
| DELETE   | `/group/:id/deleteGroupData`  | グループ削除   |

### User

| メソッド | パス                        | 説明         |
| -------- | --------------------------- | ------------ |
| GET      | `/user/getUserData`         | ユーザー検索 |
| POST     | `/user/:id/setUserData`     | ユーザー更新 |
| DELETE   | `/user/:id/deleteUserData`  | ユーザー削除 |

## エラーレスポンス

共通形式:

```ts
{
  message: string;
}
```

主なステータスコード:

- 400: 不正なリクエスト
- 401: 認証なし (`UNAUTHORIZED`)
- 403: 認可なし / メール未認証 (`EMAIL_VERIFY_MISSING`)
- 404: リソースが見つからない
- 409: 重複 / 上限到達 (招待上限 10 件など)
- 500: サーバーエラー
