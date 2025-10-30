# User モジュール仕様

## 概要

ユーザー情報管理機能を提供するモジュール
ユーザーの作成・更新・削除、プロファイル情報の取得を行う

## ディレクトリ構造

```
user/
├── userRoute.ts               # [API層] HTTPエンドポイント定義
├── handlers.ts                # [API層] リクエスト処理
└── services/                  # [ビジネスロジック層]
    └── userService.ts         # ビジネスロジック
```

## 各層の責務

### API 層

**userRoute.ts**

- HTTP エンドポイントの定義とルーティング
- リクエストのバリデーション(Zod)
- ハンドラー関数の呼び出し
- レスポンスの返却

**handlers.ts**

- リクエストデータの処理
- サービス層への処理委譲
- レスポンスデータの構築

**主要な関数:**

- `getUserHandler()` - ユーザープロファイル取得
- `createUserHandler()` - ユーザー作成
- `updateUserHandler()` - ユーザー更新
- `deleteUserHandler()` - ユーザー削除

### ビジネスロジック層

**services/userService.ts**

- ユーザー操作のビジネスロジック実装
- ユーザープロファイル情報の構築
- Firestore 操作層との橋渡し
- エラーハンドリングと HTTP 例外の生成

**主要な関数:**

- `getCurrentUser()` - ログイン中のユーザー情報取得
- `createUser()` - ユーザー作成(初回登録時のみ)
- `updateCurrentUser()` - 自分のユーザー情報更新
- `deleteCurrentUser()` - 自分のユーザー情報削除
- `getUserProfile()` - 完全なユーザープロファイル取得(グループ情報含む)

## データモデル

### UserRecord (Firestore)

```typescript
{
  displayName: string          // 表示名
  joinedGroupId?: string       // 所属グループID(オプション)
  knowGroupId: string[]        // 既知のグループID配列
}
```

### UserProfile (API レスポンス)

```typescript
{
  uid: string                    // ユーザーID(Firebase Auth)
  email: string                  // メールアドレス(Firebase Auth)
  displayName: string            // 表示名(Firestore)
  knowGroupId: string[]          // 既知のグループIDリスト(Firestore)
  joinedGroup?: {                // 所属グループ情報(オプション)
    id: string                   // グループID
    name: string                 // グループ名
    role: "ADMIN"|"EDIT"|"VIEW"  // グループ内でのロール
  }
  emailVerified: boolean         // メール認証状態(Firebase Auth)
}
```

## ビジネスルール

### ユーザー作成

**条件:**

- 認証済みユーザーのみ実行可能
- ユーザー ID は認証トークンから自動設定
- 1 ユーザーにつき 1 回のみ作成可能

**処理:**

1. 認証トークンからユーザー ID 取得
2. 既存ユーザーの存在確認
3. 存在する場合は 409 エラー
4. Firestore にユーザーレコード作成
5. 成功メッセージを返却

### ユーザー更新

**条件:**

- 認証済みユーザーのみ実行可能
- 自分自身の情報のみ更新可能
- 部分更新をサポート

**処理:**

1. 認証トークンからユーザー ID 取得
2. 更新データのバリデーション
3. Firestore のユーザーレコード更新
4. 成功メッセージを返却

**更新可能なフィールド:**

- `displayName` - 表示名
- `knowGroupId` - 既知のグループ ID リスト

**更新不可のフィールド:**

- `uid` - ユーザー ID(Firebase Auth 管理)
- `email` - メールアドレス(Firebase Auth 管理)
- `joinedGroupId` - グループ参加時に自動設定

### ユーザー削除

**条件:**

- 認証済みユーザーのみ実行可能
- 自分自身の情報のみ削除可能

**処理:**

1. 認証トークンからユーザー ID 取得
2. Firestore のユーザーレコード削除
3. 成功メッセージを返却

**注意:**

- Firebase Authentication のアカウントは削除されない
- Firestore のデータのみ削除
- 削除されたデータは復元不可
- グループに所属している場合、グループからも削除される

### プロファイル取得

**条件:**

- 認証済みユーザーのみ実行可能
- 自分自身の情報のみ取得可能

**処理:**

1. 認証トークンからユーザー ID 取得
2. Firestore からユーザーレコード取得
3. 所属グループ情報を取得(存在する場合)
4. グループ内でのロールを取得
5. Firebase Authentication から基本情報取得
6. 統合されたプロファイルを返却

**返却される情報:**

- Firestore: `displayName`, `knowGroupId`, `joinedGroupId`
- Firebase Auth: `uid`, `email`, `emailVerified`
- Group: `joinedGroup` (所属グループがある場合)

### グループ所属

**ルール:**

- ユーザーは 0 または 1 つのグループに所属可能
- `joinedGroupId`はグループ作成・参加時に自動設定
- グループ脱退時に`joinedGroupId`がクリア

**自動設定されるタイミング:**

1. グループ作成時(作成者として)
2. グループメンバー追加時

## Firebase Authentication との関係

### データの保存先

| データ                     | 保存先        | 管理方法           |
| -------------------------- | ------------- | ------------------ |
| ユーザー ID (`uid`)        | Firebase Auth | 自動生成・管理     |
| メールアドレス (`email`)   | Firebase Auth | サインアップ時設定 |
| 認証情報                   | Firebase Auth | 自動管理           |
| 表示名 (`displayName`)     | Firestore     | API で管理         |
| グループ情報               | Firestore     | API で管理         |
| アプリケーション固有データ | Firestore     | API で管理         |

### データの同期

- Firebase Authentication が認証の単一ソース
- Firestore はアプリケーションデータの保存のみ
- 両者は独立して管理される

### 認証フロー

```
1. ユーザーがFirebase Authでサインアップ
   ↓
2. IDトークンを取得
   ↓
3. POST /apiv1/userでFirestoreにユーザーレコード作成
   ↓
4. 以降はIDトークンでAPI認証
```

### アカウント削除フロー

```
1. DELETE /apiv1/userでFirestoreのユーザーレコード削除
   ↓
2. フロントエンドでFirebase Authアカウント削除
   (deleteUser関数を使用)
```

## エラーハンドリング

### 発生する可能性のある HTTPException

| ステータス    | 説明                   | 発生条件              |
| ------------- | ---------------------- | --------------------- |
| 404 Not Found | ユーザーが見つからない | 存在しないユーザー ID |
| 409 Conflict  | ユーザーが既に存在する | 作成時の重複          |

## セキュリティ

### 認証

- すべてのエンドポイントで Firebase 認証が必須
- ID トークンの検証を実施

### 認可

- ユーザーは自分自身の情報のみアクセス可能
- 他のユーザーの情報は取得・更新・削除不可

### データ保護

- ユーザー ID は認証トークンから自動取得
- リクエストで指定されたユーザー ID は無視される
- クライアントは自分のデータのみ操作可能

## 処理フロー

### ユーザー作成フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: 認証トークンからユーザーID取得
   ↓
3. Service: 既存ユーザー確認
   ↓
4. Operations: Firestoreに保存
   ↓
5. API層: レスポンス返却
```

### プロファイル取得フロー

```
1. API層: リクエスト受付
   ↓
2. Service: 認証トークンからユーザーID取得
   ↓
3. Service: Firestoreからユーザーレコード取得
   ↓
4. Service: 所属グループ情報取得(存在する場合)
   ↓
5. Service: Firebase Authから基本情報取得
   ↓
6. Service: プロファイル統合
   ↓
7. API層: レスポンス返却
```

### ユーザー更新フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: 認証トークンからユーザーID取得
   ↓
3. Operations: Firestoreを更新
   ↓
4. API層: レスポンス返却
```

### ユーザー削除フロー

```
1. API層: リクエスト受付
   ↓
2. Service: 認証トークンからユーザーID取得
   ↓
3. Operations: Firestoreから削除
   ↓
4. API層: レスポンス返却
```

## 使用例

詳細は [API 仕様書](../api/user.md) を参照

## 注意事項

### Firestore のみ削除

- DELETE API は Firestore のデータのみ削除
- Firebase Authentication のアカウントは残る
- 完全な削除にはフロントエンドで Auth 削除も必要

### グループ情報の自動管理

- `joinedGroupId`は直接更新しない
- グループ作成・参加時に自動設定
- グループ削除・脱退時に自動クリア

### 初回登録時の注意

- POST /user は 1 回のみ実行可能
- 既存ユーザーの場合は 409 エラー
- エラーハンドリングが必要
