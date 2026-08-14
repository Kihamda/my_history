# データモデル

最終更新：2026-08-14

永続データは Cloud Firestore の `scouts`、`users`、`groups` に保存します。
型と実行時検証の一次資料は `backend/src/lib/firestore/schemas.ts` です。

## Scouts コレクション

```ts
{
  belongGroupId: string;
  personal: {
    name: string;
    scoutId: string;
    birthDate: YMD;
    joinedDate: YMD;
    currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
    memo: string;
    declare: { date: YMD; place: string; done: boolean };
    religion: { date: YMD; type: string; done: boolean };
    faith: { date: YMD; done: boolean };
  };
  unit: {
    bvs: UnitData;
    cs: UnitData;
    bs: UnitData;
    vs: UnitData;
    rs: UnitData;
  };
  ginosho: Ginosho[];
  event: ScoutEvent[];
  last_Edited: YMD;
}
```

`belongGroupId` は通常の更新 API では変更できず、移管 API だけが変更します。
`last_Edited` は既存の公開フィールド名を維持しており、更新と移管の際にサーバーが当日の日付を設定します。

```ts
type YMD = string; // 空文字または実在する YYYY-MM-DD

type Detail = {
  achievedDate: YMD | null;
  done: boolean;
};

type UnitData = {
  experienced: boolean;
  joinedDate: YMD;
  work: {
    name: string;
    begin: YMD;
    end: YMD | null;
  }[];
  grade: {
    uniqueId: string;
    completedDate: YMD;
    completed: boolean;
    details: Detail[];
  }[];
};

type Ginosho = {
  uniqueId: string;
  certBy: string;
  achievedDate: YMD | null;
  details: Detail[];
};

type ScoutEvent = {
  name: string;
  type: "camp" | "volunteer" | "training" | "overseas" | "award" | "other";
  startDate: YMD;
  endDate: YMD;
  description: string;
};
```

永続スキーマの `YMD` は空文字または実在する `YYYY-MM-DD` を許可します。
配列の `null` は読み取り時に空配列へ変換します。

## Users コレクション

```ts
{
  email: string;
  profile: {
    displayName: string;
    statusMessage: string;
    acceptsInvite: boolean;
  };
  auth: {
    memberships: GroupRoleAndId[];
    invites: GroupRoleAndId[];
    shares: ShareRoleAndId[];
    isGod: boolean;
  };
}
```

Firestore では、所属、招待、共有を文字列として保存します。

```ts
type GroupRoleAndId = `${"ADMIN" | "EDIT" | "VIEW"};${groupId}`;
type ShareRoleAndId = `${"EDIT" | "VIEW"};${scoutId}`;
```

たとえば、`ADMIN;group123` は group123 の ADMIN、`VIEW;scout456` は scout456 の閲覧共有です。
各配列の上限は 10 件です。

## Groups コレクション

```ts
{
  userSettings: {
    allowSendScout: boolean;
    allowShare: boolean;
    name: string;
  };
  adminTags: {
    description: string;
  };
}
```

`allowSendScout` は他グループからの移管受け入れ、`allowShare` は新しいスカウト共有の作成を制御します。
既定値は順に `false`、`true`、`"団名"` です。
`adminTags` は God API が扱う管理データで、通常の Group API は返しません。

## 参照関係

```text
Scout.belongGroupId -------------> Group
User.auth.memberships -----------> Group
User.auth.invites ---------------> Group
User.auth.shares ----------------> Scout
```

Group から User へのメンバー配列はありません。
メンバーと招待の一覧は、User コレクションの配列を検索して組み立てます。

## ID の扱い

自動生成する Scout ID は既定で 30 文字の英数字です。
API パスの ID には、1 文字以上 100 文字以下の英数字、ハイフン、アンダースコアという共通制約を使います。
