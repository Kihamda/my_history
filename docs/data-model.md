# データモデル

実装は [backend/src/lib/firestore/schemas.ts](../backend/src/lib/firestore/schemas.ts) を参照

## Scouts コレクション

```ts
{
  belongGroupId: string;           // 所属グループID (変更不可)
  personal: {
    name: string;                  // 1-100文字
    scoutId: string;               // 1-100文字
    birthDate: string;             // YYYY-MM-DD または空文字
    joinedDate: string;            // YYYY-MM-DD または空文字
    currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
    memo: string;
    declare: {                     // ちかい
      date: string | null;
      place: string;
      done: boolean;
    };
    religion: {                    // 信仰奨励
      date: string | null;
      type: string;
      done: boolean;
    };
    faith: {                       // 信仰章
      date: string | null;
      done: boolean;
    };
  };
  unit: {                          // 部門別データ
    bvs: UnitData;                 // ビーバー
    cs: UnitData;                  // カブ
    bs: UnitData;                  // ボーイ
    vs: UnitData;                  // ベンチャー
    rs: UnitData;                  // ローバー
  };
  ginosho: Ginosho[];              // 技能章
  event: ScoutEvent[];             // イベント
  last_Edited: string;             // YYYY-MM-DD
}
```

### UnitData

```ts
{
  experienced: boolean;            // 経験あり
  joinedDate: string;              // YYYY-MM-DD または空文字
  work: {                          // 役務
    name: string;
    begin: string;                 // YYYY-MM-DD
    end: string | null;
  }[];
  grade: {                         // 進歩
    uniqueId: string;
    completedDate: string;         // YYYY-MM-DD
    completed: boolean;
    details: {
      achievedDate: string | null;
      done: boolean;
    }[];
  }[];
}
```

### Ginosho (技能章)

```ts
{
  uniqueId: string;
  certBy: string;                  // 認定者
  achievedDate: string | null;     // YYYY-MM-DD
  details: {
    achievedDate: string | null;
    done: boolean;
  }[];
}
```

### ScoutEvent

```ts
{
  name: string;
  type: "camp" | "volunteer" | "training" | "overseas" | "award" | "other";
  startDate: string;               // YYYY-MM-DD
  endDate: string;                 // YYYY-MM-DD
  description: string;
}
```

## Users コレクション

```ts
{
  email: string;                   // RFC 5322
  profile: {
    displayName: string;
    statusMessage: string;
  };
  auth: {
    memberships: string[];         // "ROLE;groupId" 形式 (最大10件)
    invites: string[];             // "ROLE;groupId" 形式 (最大10件)
    shares: string[];              // "scoutId" 形式 (最大10件)
    acceptsInvite: boolean;        // 招待受付フラグ
    isGod: boolean;                // 管理者フラグ
  };
}
```

### メンバーシップ形式

- `"ADMIN;group123"` - ADMIN ロールで group123 に所属
- `"EDIT;group456"` - EDIT ロールで group456 に所属
- `"VIEW;group789"` - VIEW ロールで group789 に所属

## Groups コレクション

```ts
{
  userSettings: {
    allowInvite: boolean;          // 招待許可 (デフォルト: true)
    allowShare: boolean;           // 共有許可 (デフォルト: true)
    name: string;                  // グループ名
  };
  adminTags: {
    description: string;           // 管理者用メモ
  };
}
```

## データ関係図

```
Scout ドキュメント
  │
  └─ belongGroupId → Group ドキュメント
                       │
                       └─ User.auth.memberships で参照

User ドキュメント
  ├─ auth.memberships → Group への所属
  ├─ auth.invites → 保留中の招待
  └─ auth.shares → 共有されたスカウトID

Group ドキュメント
  └─ メンバー情報は User.auth.memberships に分散保持
```

## 日付形式

すべての日付フィールドは `YYYY-MM-DD` 形式 (ISO 8601) を使用。
空の日付は空文字 `""` または `null` (フィールドによる)。

## ID 形式

- ドキュメントID: `[A-Za-z0-9_-]+` (1-100文字)
- 自動生成ID: 30文字の英数字
