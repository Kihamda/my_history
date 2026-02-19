# データモデル

実装は [backend/src/lib/firestore/schemas.ts](../backend/src/lib/firestore/schemas.ts) を参照

## Scouts

```ts
{
  belongGroupId: string;
  personal: {
    name: string;
    scoutId: string;
    birthDate: string; // YYYY-MM-DD
    joinedDate: string; // YYYY-MM-DD
    currentUnitId: "bvs" | "cs" | "bs" | "vs" | "rs" | "ob";
    memo: string;
    declare: { date: string; place: string; done: boolean };
    religion: { date: string; type: string; done: boolean };
    faith: { date: string; done: boolean };
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
  last_Edited: string; // YYYY-MM-DD
}
```

### UnitData

```ts
{
  experienced: boolean;
  joinedDate: string; // YYYY-MM-DD
  work: {
    name: string;
    begin: string;
    end: string | null;
  }
  [];
  grade: {
    uniqueId: string;
    completedDate: string;
    completed: boolean;
    details: {
      achievedDate: string | null;
      done: boolean;
    }
    [];
  }
  [];
}
```

### Ginosho

```ts
{
  uniqueId: string;
  certBy: string;
  achievedDate: string | null;
  details: {
    achievedDate: string | null;
    done: boolean;
  }
  [];
}
```

### ScoutEvent

```ts
{
  name: string;
  type: "camp" | "volunteer" | "training" | "overseas" | "award" | "other";
  startDate: string;
  endDate: string;
  description: string;
}
```

## Users

```ts
{
  email: string;
  profile: {
    displayName: string;
    statusMessage: string;
  };
  auth: {
    memberships: string[]; // "ROLE;groupId"
    invites: string[];     // "ROLE;groupId"
    shares: string[];      // "ROLE;scoutId"
    acceptsInvite: boolean;
    isGod: boolean;
  };
}
```

## Groups

```ts
{
  name: string;
  status: "active" | "inactive" | "archived";
}
```
