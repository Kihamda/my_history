# Scout API 仕様

## 概要

スカウト(ボーイスカウト隊員)の活動履歴を管理する API

ベースパス: `/apiv1/scout`

## 認証

すべてのエンドポイントで Firebase Authentication が必須

```
Authorization: Bearer <Firebase ID Token>
```

## エンドポイント一覧

| メソッド | パス      | 説明         | 権限                     |
| -------- | --------- | ------------ | ------------------------ |
| GET      | `/search` | スカウト検索 | グループメンバー         |
| POST     | `/create` | スカウト作成 | EDIT 以上                |
| GET      | `/:id`    | スカウト取得 | メンバーまたは authedIds |
| PUT      | `/:id`    | スカウト更新 | EDIT 以上                |
| DELETE   | `/:id`    | スカウト削除 | ADMIN のみ               |

## GET /search

グループ内のスカウトを検索

### リクエスト

**クエリパラメータ:**

| パラメータ    | 型       | 必須 | 説明                  |
| ------------- | -------- | ---- | --------------------- |
| `name`        | string   | ❌   | スカウト名(部分一致)  |
| `scoutId`     | string   | ❌   | スカウト ID(完全一致) |
| `currentUnit` | string[] | ❌   | 現在の所属隊(配列)    |
| `page`        | number   | ✅   | ページ番号(1 始まり)  |

**例:**

```
GET /apiv1/scout/search?name=太郎&page=1
GET /apiv1/scout/search?currentUnit=bs&currentUnit=vs&page=1
GET /apiv1/scout/search?scoutId=BS-001&page=1
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```typescript
{
  results: [
    {
      id: string;
      name: string;
      scoutId: string;
      currentUnitName: string;
      belongGroupId: string;
    }
  ]
}
```

**例:**

```json
{
  "results": [
    {
      "id": "abc123",
      "name": "山田太郎",
      "scoutId": "BS-001",
      "currentUnitName": "ボーイ隊",
      "belongGroupId": "group-001"
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

## POST /create

新しいスカウトを作成

### リクエスト

**ボディ:**

```typescript
{
  name: string;                    // スカウト名
  scoutId: string;                 // スカウトID
  birthDate: string;               // 生年月日(ISO 8601)
  joinedDate: string;              // 入団日(ISO 8601)
  belongGroupId: string;           // 所属グループID
  currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob";  // 現在の所属隊
  memo?: string;                   // メモ(オプション)
}
```

**例:**

```json
{
  "name": "山田太郎",
  "scoutId": "BS-001",
  "birthDate": "2010-04-01",
  "joinedDate": "2018-04-01",
  "belongGroupId": "group-001",
  "currentUnitId": "bs",
  "memo": "リーダー補"
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```typescript
{
  id: string;
  message: string;
}
```

**例:**

```json
{
  "id": "abc123",
  "message": "Scout created successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | EDIT 権限がない        |
| 404        | グループが見つからない |
| 409        | スカウト ID が重複     |

---

## GET /:id

スカウトデータを取得

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | スカウト ID |

**例:**

```
GET /apiv1/scout/abc123
```

### レスポンス

**ステータス:** 200 OK

**ボディ:** `ScoutRecordSchemaType`

```typescript
{
  authedIds: string[];
  personal: {
    name: string;
    scoutId: string;
    birthDate: string;
    joinedDate: string;
    belongGroupId: string;
    currentUnitId: "bvs"|"cs"|"bs"|"vs"|"rs"|"ob";
    memo: string;
    declare: {
      date: string | null;
      place: string;
      done: boolean;
    };
    religion: {
      date: string | null;
      type: string;
      done: boolean;
    };
    faith: {
      date: string | null;
      done: boolean;
    };
  };
  unit: {
    bvs: UnitData;
    cs: UnitData;
    bs: UnitData;
    vs: UnitData;
    rs: UnitData;
  };
  ginosho: Ginosho[];
  event: Event[];
  last_Edited: string;
}
```

**例:**

```json
{
  "authedIds": ["user-001"],
  "personal": {
    "name": "山田太郎",
    "scoutId": "BS-001",
    "birthDate": "2010-04-01",
    "joinedDate": "2018-04-01",
    "belongGroupId": "group-001",
    "currentUnitId": "bs",
    "memo": "リーダー補",
    "declare": {
      "date": "2018-09-01",
      "place": "キャンプ場",
      "done": true
    },
    "religion": {
      "date": null,
      "type": "",
      "done": false
    },
    "faith": {
      "date": null,
      "done": false
    }
  },
  "unit": {
    "bvs": { ... },
    "cs": { ... },
    "bs": { ... },
    "vs": { ... },
    "rs": { ... }
  },
  "ginosho": [],
  "event": [],
  "last_Edited": "2024-01-01T00:00:00Z"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | アクセス権限がない     |
| 404        | スカウトが見つからない |

---

## PUT /:id

スカウトデータを更新

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | スカウト ID |

**ボディ:** `ScoutRecordSchema.partial()` (部分更新)

すべてのフィールドがオプション
更新したいフィールドのみ送信

**例:**

```json
{
  "personal": {
    "currentUnitId": "vs",
    "memo": "次長"
  }
}
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Scout updated successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | EDIT 権限がない        |
| 404        | スカウトが見つからない |

---

## DELETE /:id

スカウトデータを削除

### リクエスト

**パスパラメータ:**

| パラメータ | 型     | 説明        |
| ---------- | ------ | ----------- |
| `id`       | string | スカウト ID |

**例:**

```
DELETE /apiv1/scout/abc123
```

### レスポンス

**ステータス:** 200 OK

**ボディ:**

```json
{
  "message": "Scout deleted successfully"
}
```

### エラー

| ステータス | 説明                   |
| ---------- | ---------------------- |
| 401        | 認証されていない       |
| 403        | ADMIN 権限がない       |
| 404        | スカウトが見つからない |

---

## データ型定義

### UnitData

各隊の活動データ

```typescript
{
  joined: {
    date: string | null;
    done: boolean;
  };
  up: {
    date: string | null;
    done: boolean;
  };
  grade: {
    [key: string]: {
      date: string | null;
      done: boolean;
    };
  };
}
```

### Ginosho

技能章データ

```typescript
{
  id: string;
  name: string;
  date: string;
  done: boolean;
}
```

### Event

行事章データ

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

- ✅ GET /search
- ✅ GET /:id
- ❌ POST /create
- ❌ PUT /:id
- ❌ DELETE /:id

### EDIT (編集)

- ✅ GET /search
- ✅ GET /:id
- ✅ POST /create
- ✅ PUT /:id
- ❌ DELETE /:id

### ADMIN (管理者)

- ✅ GET /search
- ✅ GET /:id
- ✅ POST /create
- ✅ PUT /:id
- ✅ DELETE /:id

## 使用例

### スカウト検索

```typescript
const response = await fetch("/apiv1/scout/search?name=太郎&page=1", {
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});

const { results } = await response.json();
```

### スカウト作成

```typescript
const response = await fetch("/apiv1/scout/create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "山田太郎",
    scoutId: "BS-001",
    birthDate: "2010-04-01",
    joinedDate: "2018-04-01",
    belongGroupId: "group-001",
    currentUnitId: "bs",
  }),
});

const { id } = await response.json();
```

### スカウト取得

```typescript
const response = await fetch(`/apiv1/scout/${scoutId}`, {
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});

const scout = await response.json();
```

### スカウト更新

```typescript
const response = await fetch(`/apiv1/scout/${scoutId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personal: {
      currentUnitId: "vs",
      memo: "次長",
    },
  }),
});
```

### スカウト削除

```typescript
const response = await fetch(`/apiv1/scout/${scoutId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});
```
