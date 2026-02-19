# セキュリティと権限設計

## 認証

- Firebase Authentication を使用
- バックエンドで ID トークン検証
- メール認証済みのみ許可

## グループロール

- `ADMIN` 最高権限
- `EDIT` 編集権限
- `VIEW` 閲覧のみ

ロールは `auth.memberships` に `ROLE;groupId` 形式で保持

## スカウト共有ロール

- `EDIT`
- `VIEW`

`auth.shares` に `ROLE;scoutId` 形式で保持

## 権限制御の基準

### スカウト

- 取得: グループメンバー または share
- 作成: グループ `EDIT` 以上
- 更新: グループ `EDIT` 以上
- 削除: グループ `ADMIN`

### グループ

- メンバー取得: `ADMIN` のみ
- 招待、ロール更新、削除: `ADMIN` のみ

### ユーザー

- 自分自身のレコードのみ操作可能

## Firestore ルール

- ルール定義は [docs/firestore.rules](firestore.rules)
- バックエンドは Service Account で Firestore にアクセスするため、ルールは API 経由では適用されない
- 直接 Firestore を使う場合に備えた安全策として運用
