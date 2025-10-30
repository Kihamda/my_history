# Scout モジュール仕様

## 概要

スカウト(ボーイスカウト隊員)の活動履歴を管理する機能を提供するモジュール

## ディレクトリ構造

```
scout/
├── scoutRoute.ts              # [API層] HTTPエンドポイント定義
├── handlers/                  # [API層] リクエスト処理
│   ├── create.ts              # スカウト作成ハンドラー
│   ├── get.ts                 # スカウト取得ハンドラー
│   ├── update.ts              # スカウト更新ハンドラー
│   ├── delete.ts              # スカウト削除ハンドラー
│   └── search.ts              # スカウト検索ハンドラー
├── services/                  # [ビジネスロジック層]
│   └── scoutService.ts        # 権限チェックとビジネスロジック
└── permissions/               # [権限チェック層]
    └── scoutPermissions.ts    # 権限判定ロジック
```

## 各層の責務

### API 層 (Route Handlers)

**scoutRoute.ts**

- HTTP エンドポイントの定義とルーティング
- リクエストのバリデーション(Zod)
- ハンドラー関数の呼び出し
- レスポンスの返却

**handlers/\*.ts**

- リクエストデータの処理
- サービス層への処理委譲
- レスポンスデータの構築

### ビジネスロジック層

**services/scoutService.ts**

- スカウト操作のビジネスロジック実装
- 権限チェック層と Firestore 操作層の橋渡し
- エラーハンドリングと HTTP 例外の生成

**主要な関数:**

- `getScoutWithAuth()` - スカウト取得(権限チェック付き)
- `createScoutWithAuth()` - スカウト作成(権限チェック付き)
- `updateScoutWithAuth()` - スカウト更新(権限チェック付き)
- `deleteScoutWithAuth()` - スカウト削除(権限チェック付き)
- `searchScoutsWithAuth()` - スカウト検索(権限チェック付き)

### 権限チェック層

**permissions/scoutPermissions.ts**

- スカウトデータへのアクセス権限の検証
- グループメンバーシップに基づく権限判定
- ロール(ADMIN/EDIT/VIEW)に応じた操作可否の判定

**主要な関数:**

- `canAccessScout()` - 閲覧権限チェック
- `canCreateScoutInGroup()` - 作成権限チェック(EDIT 以上)
- `canEditScout()` - 編集権限チェック(EDIT 以上)
- `canDeleteScout()` - 削除権限チェック(ADMIN 必須)
- `canSearchScoutsInGroup()` - 検索権限チェック(メンバーなら可)

## データモデル

### ScoutRecord

```typescript
{
  authedIds: string[]           // アクセス権を持つユーザーID配列
  personal: {                   // 個人情報
    name: string                // 氏名
    scoutId: string             // スカウトID
    birthDate: string           // 生年月日
    joinedDate: string          // 入団日
    belongGroupId: string       // 所属グループID
    currentUnitId: UnitId       // 現在の所属隊
    memo: string                // メモ
    declare: {                  // ちかい・やくそく
      date: string | null
      place: string
      done: boolean
    }
    religion: {                 // 信仰奨励章
      date: string | null
      type: string
      done: boolean
    }
    faith: {                    // 富士スカウト章/菊スカウト章
      date: string | null
      done: boolean
    }
  }
  unit: {                       // 各隊の活動履歴
    bvs: UnitData               // ビーバースカウト
    cs: UnitData                // カブスカウト
    bs: UnitData                // ボーイスカウト
    vs: UnitData                // ベンチャースカウト
    rs: UnitData                // ローバースカウト
  }
  ginosho: Ginosho[]           // 技能章配列
  event: Event[]               // 行事章配列
  last_Edited: string          // 最終編集日時
}
```

### UnitData

```typescript
{
  joined: {
    date: string | null
    done: boolean
  }
  up: {
    date: string | null
    done: boolean
  }
  grade: {
    [gradeId: string]: {
      date: string | null
      done: boolean
    }
  }
}
```

### Ginosho (技能章)

```typescript
{
  id: string;
  name: string;
  date: string;
  done: boolean;
}
```

### Event (行事章)

```typescript
{
  id: string;
  name: string;
  date: string;
  done: boolean;
}
```

## 権限レベル

### VIEW (閲覧)

- ✅ スカウトの検索・閲覧が可能
- ❌ 編集・削除は不可

### EDIT (編集)

- ✅ VIEW の権限に加えて
- ✅ スカウトの作成・更新が可能
- ❌ 削除は不可

### ADMIN (管理者)

- ✅ EDIT の権限に加えて
- ✅ スカウトの削除が可能
- ✅ グループ管理が可能

## アクセス制御

### スカウトへのアクセス条件

以下のいずれかを満たす必要がある:

1. **グループメンバー**: スカウトの所属グループのメンバーである
2. **authedIds**: スカウトの`authedIds`配列にユーザー ID が含まれる

### 操作別の権限要件

| 操作 | 必要な権限                        |
| ---- | --------------------------------- |
| 検索 | グループメンバー                  |
| 閲覧 | グループメンバー または authedIds |
| 作成 | グループの EDIT 以上              |
| 更新 | グループの EDIT 以上              |
| 削除 | グループの ADMIN のみ             |

## ビジネスルール

### スカウト作成

1. グループの EDIT 権限以上が必要
2. スカウト ID はランダムに生成
3. 初期データとして全隊の活動履歴を未経験状態で作成
4. 作成者のユーザー ID を`authedIds`に追加
5. `last_Edited`に現在日時を設定

### スカウト更新

1. グループの EDIT 権限以上が必要
2. 部分更新をサポート
3. `last_Edited`を自動更新

### スカウト削除

1. グループの ADMIN 権限が必須
2. 削除されたデータは復元不可
3. 物理削除を実行

### スカウト検索

1. グループメンバーであれば検索可能
2. 自分のグループのスカウトのみ検索対象
3. ページネーション対応

## エラーハンドリング

### 発生する可能性のある HTTPException

| ステータス    | 説明                                 | 発生条件                         |
| ------------- | ------------------------------------ | -------------------------------- |
| 404 Not Found | スカウトまたはグループが見つからない | 存在しない ID を指定             |
| 403 Forbidden | 権限がない                           | 必要な権限レベルを満たしていない |
| 409 Conflict  | データの競合                         | 作成時の ID 重複など             |

## 処理フロー

### スカウト作成フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Handler: 初期データ構築
   ↓
3. Service: 権限チェック(EDIT以上)
   ↓
4. Service: ランダムID生成
   ↓
5. Operations: Firestoreに保存
   ↓
6. API層: レスポンス返却
```

### スカウト取得フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: Firestoreから取得
   ↓
3. Service: 存在チェック
   ↓
4. Permissions: アクセス権限チェック
   ↓
5. API層: レスポンス返却
```

### スカウト更新フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: 既存データ取得と存在チェック
   ↓
3. Permissions: 編集権限チェック(EDIT以上)
   ↓
4. Service: last_Edited更新
   ↓
5. Operations: Firestoreを更新
   ↓
6. API層: レスポンス返却
```

### スカウト削除フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: 既存データ取得と存在チェック
   ↓
3. Permissions: 削除権限チェック(ADMIN必須)
   ↓
4. Operations: Firestoreから削除
   ↓
5. API層: レスポンス返却
```

### スカウト検索フロー

```
1. API層: リクエスト受付とバリデーション
   ↓
2. Service: グループ取得と権限チェック
   ↓
3. Operations: Firestoreで検索
   ↓
4. Handler: クライアント向け形式に変換
   ↓
5. API層: レスポンス返却
```

## パフォーマンス最適化

### インデックス

以下の Firestore インデックスが必要:

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

### ページネーション

検索結果は 20 件ごとにページング

## セキュリティ

### 多層防御

1. Firebase Authentication による認証
2. グループメンバーシップの確認
3. ロールベースのアクセス制御
4. `authedIds`による追加のアクセス制御

### データ保護

- グループ外のユーザーはスカウトデータにアクセス不可
- 権限レベルに応じて操作を制限
- Zod による厳密な入力検証

## 使用例

詳細は [API 仕様書](../api/scout.md) を参照
