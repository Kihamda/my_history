# My History Backend API 概要

## システム構成

- **実行環境**: Cloudflare Workers 上で Hono を使用
- **認証**: Firebase Identity Toolkit (メールとパスワード)
- **データストア**: Firestore (REST API) を独自クライアントで呼び出し
- **設計思想**:
  - すべての処理は JSON ベースで統一
  - エラーは `error` フィールドを持つ JSON で返却
  - 認証済みトークンは `Authorization: Bearer <ID_TOKEN>` ヘッダーで受け付け

## 認証フロー

1. クライアントが `POST /api/auth/login` にメールアドレスとパスワードを送信
2. Firebase Identity Toolkit で認証し、ID トークンとリフレッシュトークンを取得
3. ID トークンは Cloudflare Workers の API 呼び出しで利用
4. 有効期限切れ時は `POST /api/auth/refresh` にリフレッシュトークンを送信し更新
5. すべての保護されたルートはミドルウェア `requireAuth` が ID トークンを検証

## ミドルウェアとエラーハンドリング

- `requireAuth`
  - `Authorization` ヘッダーを検証
  - Firebase Admin API を用いて署名とクレームを検証
  - 検証結果を `c.set("auth", { token, claims, user })` で後続ハンドラへ共有
- 共通エラーハンドラ
  - `FirebaseAuthError`: `status` と `code` をそのまま JSON で返却
  - その他例外: 500 (INTERNAL_SERVER_ERROR)
  - 未定義ルート: 404 (NOT_FOUND)

## エンドポイント一覧

| メソッド | パス                       | 認証 | 説明                                            |
| -------- | -------------------------- | ---- | ----------------------------------------------- |
| POST     | `/api/auth/login`          | 不要 | メールとパスワードでログイン                    |
| POST     | `/api/auth/refresh`        | 不要 | リフレッシュトークンで ID トークン更新          |
| GET      | `/api/auth/me`             | 必須 | Bearer トークンの検証結果を返す                 |
| GET      | `/api/users/me`            | 必須 | 自身のユーザー情報と設定                        |
| PUT      | `/api/users/me`            | 必須 | ユーザー設定を更新                              |
| GET      | `/api/groups/current`      | 必須 | 現在所属団体と参加 ID                           |
| GET      | `/api/groups/:groupId`     | 必須 | 指定 ID の団体詳細 (本人が所属している場合のみ) |
| GET      | `/api/scouts/:scoutId`     | 必須 | 個別隊員の詳細 (所属チェックあり)               |
| PUT      | `/api/scouts/:scoutId`     | 必須 | 隊員情報を更新 (編集権限がある場合のみ)         |
| POST     | `/api/scouts/search`       | 必須 | 条件付きで隊員を検索 (リーダー権限のみ)         |
| GET      | `/api/masters/ginosho`     | 必須 | 技能章マスター一覧                              |
| GET      | `/api/masters/ginosho/:id` | 必須 | 技能章詳細                                      |
| GET      | `/api/masters/grade`       | 必須 | 進級章マスター一覧                              |
| GET      | `/api/masters/grade/:id`   | 必須 | 進級章詳細                                      |

## 詳細仕様

### POST `/api/auth/login`

- **リクエスト**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **成功レスポンス** `200`
  ```json
  {
    "tokens": {
      "idToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    },
    "user": {
      "localId": "uid",
      "email": "user@example.com",
      "displayName": "Name"
    }
  }
  ```
- **失敗例**
  - `400 EMAIL_AND_PASSWORD_REQUIRED`
  - `401 INVALID_PASSWORD` など Firebase エラーコード

### POST `/api/auth/refresh`

- **リクエスト**
  ```json
  {
    "refreshToken": "..."
  }
  ```
- **成功レスポンス**
  ```json
  {
    "tokens": {
      "idToken": "refreshed",
      "refreshToken": "...",
      "expiresIn": 3600
    },
    "user": {
      "localId": "uid",
      "email": "user@example.com"
    }
  }
  ```
- **失敗例** `400 MISSING_REFRESH_TOKEN`

### GET `/api/auth/me`

- **ヘッダー** `Authorization: Bearer <ID_TOKEN>`
- **成功レスポンス**
  ```json
  {
    "token": "...",
    "claims": {
      "user_id": "uid",
      "email": "user@example.com"
    },
    "user": {
      "localId": "uid",
      "email": "user@example.com"
    }
  }
  ```

### GET `/api/users/me`

- **処理**: Firestore からユーザー設定 (`settings`) と Firebase ユーザー情報を取得
- **レスポンス例**
  ```json
  {
    "user": {
      "id": "uid",
      "email": "user@example.com"
    },
    "settings": {
      "joinGroupId": "group-123",
      "displayName": "たろう"
    }
  }
  ```

### PUT `/api/users/me`

- **リクエスト例**
  ```json
  {
    "displayName": "たろう",
    "joinGroupId": "group-123"
  }
  ```
- **処理**
  1. JSON 本文を検証し不要なフィールドを除去
  2. Firestore の `users` コレクションを更新
  3. 更新後の値を `GET /me` と同形式で返却

### GET `/api/groups/current`

- **処理**
  1. ユーザー設定の `joinGroupId` を取得
  2. 団体情報とメンバー権限を同時取得
  3. 見つからない場合は 404 と `group: null`

### GET `/api/groups/:groupId`

- **ガード**: リクエストユーザーの `joinGroupId` が URL と一致するか確認
- **レスポンス例**
  ```json
  {
    "id": "group-123",
    "name": "テスト第1団",
    "district": "東京"
  }
  ```
- **エラー**
  - `400 GROUP_ID_REQUIRED`
  - `403 GROUP_FORBIDDEN`
  - `404 GROUP_NOT_FOUND`

### GET `/api/scouts/:scoutId`

- **処理**
  1. `ensureUserContext` で所属団体と権限を取得
  2. Firestore から該当隊員記録を取得
  3. 所属団体が異なる場合は `403 SCOUT_FORBIDDEN`

### PUT `/api/scouts/:scoutId`

- **バリデーション**
  - `personal.name` は必須
  - `unit`, `ginosho`, `events` は配列で、各要素をサニタイズ
  - `id` が URL パラメータと一致しない場合は `400 SCOUT_ID_MISMATCH`
- **処理の流れ**
  1. JSON を解析し `sanitizeScoutUpdate` で内部型へ変換
  2. Firestore へ保存
  3. 保存直後に再取得し最新データを返却

### POST `/api/scouts/search`

- **リクエスト例**
  ```json
  {
    "name": "山田",
    "currentUnit": ["troop-1"],
    "limit": 20
  }
  ```
- **ビジネスルール**
  - `name` `scoutId` `currentUnit` のいずれかは必須
  - `limit` は 1〜100 の整数に丸め
  - リーダー権限 (`context.isLeader`) がない場合は `403 SCOUT_SEARCH_FORBIDDEN`

### GET `/api/masters/*`

- **共通仕様**
  - Firestore に保存されているマスターを読み取り専用で返却
  - 見つからない場合は `404 GINOSHO_NOT_FOUND` または `404 GRADE_NOT_FOUND`

## ドメインモデル概要

- `users`
  - `settings`: `displayName`, `joinGroupId`, 通知設定などを保持
- `groups`
  - `members/{email}`: `role` により `admin` `edit` `view` を判定
- `scouts`
  - `personal`: 名前や所属、ScoutId など
  - `unit`: 隊経験の配列 (進級章と活動記録を内包)
  - `ginosho`: 技能章取得状況
  - `events`: 任意の活動イベント

## 開発時の注意点

- 新規エンドポイントを追加する際は `/src/routers` 配下でルーターを作成
- ルーターから Firestore 操作用関数を呼ぶ場合は `/src/repositories` に集約
- 認証が必要な処理は `requireAuth` を必ず適用し、所属チェックが必要なら `ensureUserContext` を流用
- エラーは `FirebaseAuthError` を通してステータス・コード・メッセージを一元管理
