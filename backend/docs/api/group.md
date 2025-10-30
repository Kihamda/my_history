# Group API 仕様

## 概要

グループ(団)の管理とメンバー権限管理を行う API

ベースパス: `/apiv1/group`

## 認証

すべてのエンドポイントで Firebase Authentication が必須

```
Authorization: Bearer <Firebase ID Token>
```

## エンドポイント一覧

| メソッド | パス                       | 説明         | 権限     |
| -------- | -------------------------- | ------------ | -------- |
| GET      | `/:id`                     | グループ取得 | メンバー |
| POST     | `/`                        | グループ作成 | 認証済み |
| PUT      | `/:id`                     | グループ更新 | ADMIN    |
| DELETE   | `/:id`                     | グループ削除 | ADMIN    |
| POST     | `/:id/members`             | メンバー追加 | ADMIN    |
| DELETE   | `/:id/members/:email`      | メンバー削除 | ADMIN    |
| PUT      | `/:id/members/:email/role` | ロール変更   | ADMIN    |

## GET /:id

グループ情報を取得

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | グループ ID |

**例:**

```
GET /apiv1/group/group-001
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```typescript
{
  name: string;                   // グループ名
  status: "ACTIVE" | "INACTIVE";  // ステータス
  members: [                      // メンバーリスト
    {
      userEmail: string;          // ユーザーのメールアドレス
      role: "ADMIN" | "EDIT" | "VIEW";  // ロール
    }
  ]
}
```

**例:**

```json
{
  "name": "○○第1団",
  "status": "ACTIVE",
  "members": [
    {
      "userEmail": "admin@example.com",
      "role": "ADMIN"
    },
    {
      "userEmail": "leader@example.com",
      "role": "EDIT"
    },
    {
      "userEmail": "viewer@example.com",
      "role": "VIEW"
    }
  ]
}
```

### エラー

| ステータス | 説明                     |
| ---------- | ------------------------ |
| 401        | 認証されていない         |
| 403        | グループメンバーではない |
| 404        | グループが見つからない   |

---

## POST /

グループを作成

### リクエスト

**ボディ:**

```typescript
{
  name: string; // グループ名
  status: "ACTIVE" | "INACTIVE"; // ステータス
}
```

**例:**

```json
{
  "name": "○○第1団",
  "status": "ACTIVE"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "id": "group-001",
  "message": "Group created successfully"
}
```

### エラー

| ステータス | 説明             |
| ---------- | ---------------- |
| 401        | 認証されていない |

### 注意事項

- 作成者は自動的に ADMIN ロールで追加される
- 作成者のユーザー情報に`joinedGroupId`が設定される
- グループ ID はランダムに生成される

---

## PUT /:id

グループ情報を更新

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | グループ ID |

**ボディ:** `GroupRecordSchema.partial()` (部分更新)

```typescript
{
  name?: string;                  // グループ名
  status?: "ACTIVE" | "INACTIVE"; // ステータス
}
```

**例:**

```json
{
  "name": "○○第2団"
}
```

```json
{
  "status": "INACTIVE"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Group updated successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | ADMIN 権限がない       |
| 404        | グループが見つからない |

---

## DELETE /:id

グループを削除

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | グループ ID |

**例:**

```
DELETE /apiv1/group/group-001
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Group deleted successfully"
}
```

### エラー

| ステータス | 説明                                       |
| ---------- | ------------------------------------------ |
| 401        | 認証されていない                           |
| 403        | ADMIN 権限がない、またはメンバーが複数いる |
| 404        | グループが見つからない                     |

### 制限事項

- メンバーが 1 人のみの場合のみ削除可能
- 複数メンバーがいる場合は 403 エラー
- 先にメンバーを削除してから実行

---

## POST /:id/members

グループにメンバーを追加

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | グループ ID |

**ボディ:**

```typescript
{
  userEmail: string; // 追加するユーザーのメールアドレス
  role: "ADMIN" | "EDIT" | "VIEW"; // ロール
}
```

**例:**

```json
{
  "userEmail": "newmember@example.com",
  "role": "EDIT"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Member added successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | ADMIN 権限がない       |
| 404        | グループが見つからない |
| 409        | メンバーが既に存在する |

---

## DELETE /:id/members/:email

グループからメンバーを削除

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明                     |
| ---------- | ------ | ------------------------ |
| `id`       | string | グループ ID              |
| `email`    | string | 削除対象のメールアドレス |

**例:**

```
DELETE /apiv1/group/group-001/members/member@example.com
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Member removed successfully"
}
```

### エラー

| ステータス | 説明                                                    |
| ---------- | ------------------------------------------------------- |
| 401        | 認証されていない                                        |
| 403        | ADMIN 権限がない、または最後の ADMIN を削除しようとした |
| 404        | グループまたはメンバーが見つからない                    |

### 制限事項

- 最後の ADMIN は削除不可
- 削除後も ADMIN が 1 人以上残る必要がある

---

## PUT /:id/members/:email/role

メンバーのロールを更新

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明                     |
| ---------- | ------ | ------------------------ |
| `id`       | string | グループ ID              |
| `email`    | string | 更新対象のメールアドレス |

**ボディ:**

```typescript
{
  role: "ADMIN" | "EDIT" | "VIEW"; // 新しいロール
}
```

**例:**

```json
{
  "role": "ADMIN"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Member role updated successfully"
}
```

### エラー

| ステータス | 説明                                                      |
| ---------- | --------------------------------------------------------- |
| 401        | 認証されていない                                          |
| 403        | ADMIN 権限がない、または最後の ADMIN のロール変更を試みた |
| 404        | グループまたはメンバーが見つからない                      |

### 制限事項

- 最後の ADMIN のロール変更は不可
- 変更後も ADMIN が 1 人以上残る必要がある

---

## ロール(権限レベル)

### VIEW (閲覧)

**できること:**

- グループ情報の閲覧
- スカウト情報の閲覧
- グループ内スカウトの検索

**できないこと:**

- スカウトの作成・編集・削除
- グループ設定の変更
- メンバー管理

### EDIT (編集)

**できること:**

- VIEW の権限に加えて
- スカウトの作成・更新
- 自分のプロフィール編集

**できないこと:**

- スカウトの削除
- グループ設定の変更
- メンバー管理

### ADMIN (管理者)

**できること:**

- EDIT の権限に加えて
- スカウトの削除
- グループ設定の変更
- メンバーの追加・削除
- メンバーのロール変更
- グループの削除

**責任:**

- グループ内のデータ管理
- メンバーの権限管理
- 最低 1 人の ADMIN を維持

## ビジネスルール

### グループ作成

- 作成者が自動的に ADMIN ロールで追加される
- 作成者のユーザー情報に`joinedGroupId`が設定される
- ステータスは ACTIVE または INACTIVE を選択可能

### グループ削除

- ADMIN 権限が必要
- メンバーが 1 人のみの場合のみ削除可能
- 複数メンバーがいる場合はエラー

### メンバー管理

- ADMIN 権限が必要
- 最低 1 人の ADMIN を維持する必要がある
- 最後の ADMIN は削除・ロール変更不可

### メンバーシップ

- ユーザーは 1 つのグループにのみ所属可能
- グループ作成時に自動的に所属グループが設定される

## 使用例

### グループ取得

```typescript
const response = await fetch(`/apiv1/group/${groupId}`, {
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});

const group = await response.json();
console.log(group.name);
console.log(group.members);
```

### グループ作成

```typescript
const response = await fetch("/apiv1/group", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "○○第1団",
    status: "ACTIVE",
  }),
});

const { id } = await response.json();
console.log(`グループID: ${id}`);
```

### グループ更新

```typescript
const response = await fetch(`/apiv1/group/${groupId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    status: "INACTIVE",
  }),
});
```

### メンバー追加

```typescript
const response = await fetch(`/apiv1/group/${groupId}/members`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userEmail: "newmember@example.com",
    role: "EDIT",
  }),
});
```

### メンバー削除

```typescript
const email = encodeURIComponent("member@example.com");
const response = await fetch(`/apiv1/group/${groupId}/members/${email}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});
```

### ロール変更

```typescript
const email = encodeURIComponent("member@example.com");
const response = await fetch(`/apiv1/group/${groupId}/members/${email}/role`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    role: "ADMIN",
  }),
});
```

## エラーハンドリング例

```typescript
try {
  const response = await fetch(`/apiv1/group/${groupId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userEmail: email,
      role: "EDIT",
    }),
  });

  if (response.status === 409) {
    console.log("メンバーは既に存在します");
  } else if (response.status === 403) {
    console.log("ADMIN権限が必要です");
  } else if (!response.ok) {
    throw new Error("メンバー追加に失敗しました");
  }

  console.log("メンバーを追加しました");
} catch (error) {
  console.error("エラー:", error);
}
```
