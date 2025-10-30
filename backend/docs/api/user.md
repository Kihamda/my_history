# User API 仕様

## 概要

ユーザープロファイルと所属グループ情報を管理する API

ベースパス: `/apiv1/user`

## 認証

すべてのエンドポイントで Firebase Authentication が必須

```
Authorization: Bearer <Firebase ID Token>
```

## エンドポイント一覧

| メソッド | パス | 説明             | 権限     |
| -------- | ---- | ---------------- | -------- |
| GET      | `/`  | プロファイル取得 | 自分自身 |
| POST     | `/`  | ユーザー作成     | 認証済み |
| PUT      | `/`  | プロファイル更新 | 自分自身 |
| DELETE   | `/`  | ユーザー削除     | 自分自身 |

## GET /

ログイン中のユーザーのプロファイル情報を取得

### リクエスト

クエリパラメータなし

**例:**

```
GET /apiv1/user
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```typescript
{
  uid: string;                    // ユーザーID
  email: string;                  // メールアドレス
  displayName: string;            // 表示名
  knowGroupId: string[];          // 既知のグループIDリスト
  joinedGroup?: {                 // 所属グループ情報(オプション)
    id: string;                   // グループID
    name: string;                 // グループ名
    role: "ADMIN" | "EDIT" | "VIEW";  // グループ内でのロール
  };
  emailVerified: boolean;         // メール認証状態
}
```

**例:**

```json
{
  "uid": "user-001",
  "email": "user@example.com",
  "displayName": "山田太郎",
  "knowGroupId": ["group-001", "group-002"],
  "joinedGroup": {
    "id": "group-001",
    "name": "○○第1団",
    "role": "ADMIN"
  },
  "emailVerified": true
}
```

**所属グループがない場合:**

```json
{
  "uid": "user-001",
  "email": "user@example.com",
  "displayName": "山田太郎",
  "knowGroupId": [],
  "emailVerified": true
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 404        | ユーザーが見つからない |

---

## POST /

新規ユーザーを作成(初回登録時)

### リクエスト

**ボディ:**

```typescript
{
  displayName: string;            // 表示名
  knowGroupId?: string[];         // 既知のグループIDリスト(オプション)
  joinedGroupId?: string;         // 所属グループID(オプション)
}
```

**例:**

```json
{
  "displayName": "山田太郎",
  "knowGroupId": ["group-001"],
  "joinedGroupId": "group-001"
}
```

**最小限の例:**

```json
{
  "displayName": "山田太郎"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "User created successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 409        | ユーザーが既に存在する |

### 注意事項

- ユーザー ID は認証トークンから自動的に設定される
- 1 ユーザーにつき 1 回のみ作成可能
- 既存ユーザーの場合は 409 エラー

---

## PUT /

ログイン中のユーザー情報を更新

### リクエスト

**ボディ:** `UserRecordSchema.partial()` (部分更新)

すべてのフィールドがオプション
更新したいフィールドのみ送信

```typescript
{
  displayName?: string;           // 表示名
  knowGroupId?: string[];         // 既知のグループIDリスト
}
```

**例:**

```json
{
  "displayName": "山田次郎"
}
```

```json
{
  "knowGroupId": ["group-001", "group-002", "group-003"]
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "User updated successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 404        | ユーザーが見つからない |

### 注意事項

- `joinedGroupId`はグループ参加時に自動設定されるため、直接更新は推奨されない
- 提供されたフィールドのみが更新される

---

## DELETE /

ログイン中のユーザー情報を削除

### リクエスト

リクエストボディなし

**例:**

```
DELETE /apiv1/user
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "User deleted successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 404        | ユーザーが見つからない |

### 注意事項

- Firebase Authentication のアカウントは削除されない(Firestore のみ)
- 削除されたデータは復元できない
- グループに所属している場合、グループからも自動削除される

---

## データモデル

### UserRecord

Firestore に保存されるユーザーデータ

```typescript
{
  displayName: string;            // 表示名
  knowGroupId: string[];          // 既知のグループIDリスト
  joinedGroupId?: string;         // 所属グループID(オプション)
}
```

### UserProfile (レスポンス)

API レスポンスで返却されるユーザープロファイル

```typescript
{
  uid: string;                    // ユーザーID(Firebase Auth)
  email: string;                  // メールアドレス(Firebase Auth)
  displayName: string;            // 表示名(Firestore)
  knowGroupId: string[];          // 既知のグループIDリスト(Firestore)
  joinedGroup?: {                 // 所属グループ情報(オプション)
    id: string;                   // グループID
    name: string;                 // グループ名
    role: "ADMIN"|"EDIT"|"VIEW"   // グループ内でのロール
  };
  emailVerified: boolean;         // メール認証状態(Firebase Auth)
}
```

## ビジネスルール

### ユーザー作成

- 認証済みユーザーのみ実行可能
- ユーザー ID は認証トークンから自動設定
- 1 ユーザーにつき 1 回のみ作成可能
- 既存ユーザーの場合は 409 エラー

### ユーザー更新

- 認証済みユーザーのみ実行可能
- 自分自身の情報のみ更新可能
- 部分更新をサポート

### ユーザー削除

- 認証済みユーザーのみ実行可能
- 自分自身の情報のみ削除可能
- Firebase Authentication のアカウントは削除されない

### グループ所属

- ユーザーは 0 または 1 つのグループに所属
- `joinedGroupId`はグループ作成・参加時に自動設定
- グループ脱退時に`joinedGroupId`がクリアされる

## 使用例

### プロファイル取得

```typescript
const response = await fetch("/apiv1/user", {
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});

const profile = await response.json();
console.log(profile.displayName);
console.log(profile.joinedGroup?.name);
```

### ユーザー作成

```typescript
const response = await fetch("/apiv1/user", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    displayName: "山田太郎",
    knowGroupId: ["group-001"],
  }),
});

if (response.status === 409) {
  console.log("ユーザーは既に存在します");
}
```

### プロファイル更新

```typescript
const response = await fetch("/apiv1/user", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    displayName: "山田次郎",
  }),
});
```

### ユーザー削除

```typescript
const response = await fetch("/apiv1/user", {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});

if (response.ok) {
  console.log("ユーザーが削除されました");
  // Firebase Authenticationからもサインアウト
  await auth.signOut();
}
```

## Firebase Authentication との関係

### データの保存先

- **Firebase Authentication**: ユーザー ID、メールアドレス、認証情報
- **Firestore**: 表示名、グループ情報、アプリケーション固有データ

### データの同期

- Firebase Authentication が認証の単一ソース
- Firestore はアプリケーションデータの保存のみ
- ユーザー削除時は Firestore のみ削除(Auth 削除は別途実施)

### 認証フロー

1. ユーザーが Firebase Authentication でサインアップ
2. ID トークンを取得
3. POST /user で Firestore にユーザーレコード作成
4. 以降は ID トークンで API 認証

### アカウント削除フロー

1. DELETE /user で Firestore のユーザーレコード削除
2. フロントエンドで Firebase Authentication アカウントを削除
   ```typescript
   await deleteUser(auth.currentUser);
   ```
