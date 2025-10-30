# セットアップとデプロイ

## 前提条件

- Node.js (v18 以上)
- npm
- Firebase プロジェクト
- Cloudflare アカウント
- Wrangler CLI

## 初期セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトの設定

Firebase コンソールで以下を設定:

1. **Authentication の有効化**

   - メール/パスワード認証を有効にする
   - 必要に応じて他の認証方法も有効化

2. **Firestore の作成**

   - ネイティブモードで Firestore を作成
   - リージョンを選択

3. **サービスアカウントの作成**
   - Firebase コンソール → プロジェクト設定 → サービスアカウント
   - 秘密鍵を生成してダウンロード

### 3. Cloudflare Workers の設定

#### 環境変数の設定

以下の環境変数を設定:

| 変数名                         | 説明                               | 取得方法                               |
| ------------------------------ | ---------------------------------- | -------------------------------------- |
| `PROJECT_ID`                   | Firebase プロジェクト ID           | Firebase コンソール → プロジェクト設定 |
| `FIREBASE_CLIENT_EMAIL`        | サービスアカウントのメールアドレス | サービスアカウント JSON から           |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | サービスアカウント秘密鍵           | サービスアカウント JSON から           |
| `PUBLIC_JWK_CACHE_KEY`         | JWK キャッシュキー                 | 任意の文字列                           |

#### wrangler.toml の設定

```toml
name = "my-history-backend"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
PROJECT_ID = "your-project-id"
PUBLIC_JWK_CACHE_KEY = "your-cache-key"

[[kv_namespaces]]
binding = "MY_HISTORY_KV_CACHE"
id = "your-kv-namespace-id"
```

#### シークレットの設定

```bash
# Firebase サービスアカウント秘密鍵
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY

# Firebase サービスアカウントメール
wrangler secret put FIREBASE_CLIENT_EMAIL
```

### 4. KV ネームスペースの作成

```bash
# 本番環境用
wrangler kv:namespace create "MY_HISTORY_KV_CACHE"

# 開発環境用
wrangler kv:namespace create "MY_HISTORY_KV_CACHE" --preview
```

出力された ID を `wrangler.toml` に設定

## ローカル開発

### 開発サーバーの起動

```bash
npm run dev
```

デフォルトで `http://localhost:8787` で起動

### Firebase エミュレータとの連携

Firebase Auth エミュレータを使用する場合:

```bash
# wrangler.toml に追加
[vars]
FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"
```

### 型定義の生成

Cloudflare Workers の型定義を生成:

```bash
npm run cf-typegen
```

## デプロイ

### 本番環境へのデプロイ

```bash
npm run deploy
```

### デプロイの確認

```bash
# デプロイ状況の確認
wrangler deployments list

# ログの確認
wrangler tail
```

## Firestore インデックスの作成

以下のインデックスを Firestore コンソールで作成:

### Scouts コレクション

```
コレクション: scouts
フィールド:
  - personal.belongGroupId (昇順)
  - personal.name (昇順)

コレクション: scouts
フィールド:
  - personal.belongGroupId (昇順)
  - personal.scoutId (昇順)

コレクション: scouts
フィールド:
  - personal.belongGroupId (昇順)
  - personal.currentUnitId (昇順)
```

または `firestore.indexes.json` を使用:

```json
{
  "indexes": [
    {
      "collectionGroup": "scouts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "personal.belongGroupId", "order": "ASCENDING" },
        { "fieldPath": "personal.name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "scouts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "personal.belongGroupId", "order": "ASCENDING" },
        { "fieldPath": "personal.scoutId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "scouts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "personal.belongGroupId", "order": "ASCENDING" },
        { "fieldPath": "personal.currentUnitId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

デプロイ:

```bash
firebase deploy --only firestore:indexes
```

## Firestore セキュリティルール

`firestore.rules` の例:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // グループコレクション
    match /groups/{groupId} {
      allow read: if request.auth != null &&
                     request.auth.token.email in resource.data.members.map(m => m.userEmail);
      allow write: if request.auth != null;
    }

    // スカウトコレクション
    match /scouts/{scoutId} {
      allow read: if request.auth != null &&
                     (request.auth.uid in resource.data.authedIds ||
                      request.auth.token.email in get(/databases/$(database)/documents/groups/$(resource.data.personal.belongGroupId)).data.members.map(m => m.userEmail));
      allow write: if request.auth != null;
    }
  }
}
```

デプロイ:

```bash
firebase deploy --only firestore:rules
```

## トラブルシューティング

### デプロイエラー

#### "No such namespace"

```bash
# KVネームスペースを再作成
wrangler kv:namespace create "MY_HISTORY_KV_CACHE"
```

#### "Invalid service account key"

```bash
# シークレットを再設定
wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
```

### ローカル開発エラー

#### "Port 8787 is already in use"

```bash
# ポートを変更
wrangler dev --port 8788
```

#### "KV namespace not found"

```bash
# プレビュー用KVネームスペースを作成
wrangler kv:namespace create "MY_HISTORY_KV_CACHE" --preview
```

### Firebase 接続エラー

#### "Permission denied"

- Firestore ルールを確認
- サービスアカウントの権限を確認
- プロジェクト ID が正しいか確認

#### "Resource not found"

- Firestore が有効になっているか確認
- コレクション名が正しいか確認

## パフォーマンス最適化

### KV キャッシュの活用

JWK 公開鍵は KV にキャッシュされる
キャッシュ期限: 24 時間

### Firestore クエリの最適化

- 適切なインデックスを作成
- 不要なフィールドは取得しない
- ページネーションを活用

## モニタリング

### Cloudflare Analytics

Cloudflare ダッシュボードでリクエスト数、エラー率を確認

### ログの確認

```bash
# リアルタイムログ
wrangler tail

# 特定の期間のログ
wrangler tail --since 1h
```

### エラー追跡

Sentry などのエラー追跡サービスの統合を推奨

## セキュリティチェックリスト

- [ ] Firebase サービスアカウント秘密鍵をシークレットに保存
- [ ] Firestore セキュリティルールを設定
- [ ] CORS 設定を本番ドメインに限定
- [ ] 環境変数を `.env` に保存しない
- [ ] `.gitignore` にシークレット情報を追加
- [ ] 定期的に依存関係を更新

## バックアップ

### Firestore のバックアップ

```bash
# gcloudコマンドでエクスポート
gcloud firestore export gs://[BUCKET_NAME]
```

定期的な自動バックアップを設定推奨

## 本番環境チェックリスト

デプロイ前の確認事項:

- [ ] すべてのテストが通過
- [ ] Firestore インデックスが作成済み
- [ ] Firestore セキュリティルールが設定済み
- [ ] 環境変数とシークレットが正しく設定済み
- [ ] KV ネームスペースが作成済み
- [ ] エラーハンドリングが適切
- [ ] ログが適切に出力されてる
- [ ] パフォーマンステストを実施
- [ ] セキュリティスキャンを実施
