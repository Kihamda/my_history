import { FirestoreClient } from "firebase-rest-firestore";
import { z, ZodType } from "zod/v4";
import { generateRandomId } from "../randomId";

// Firestoreクエリのデフォルト上限値
const DEFAULT_LIMIT = 20;

// ファッキン黒魔術: FirestoreのCRUD操作を型安全に行うための汎用型定義
type WhereOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "in"
  | "array-contains-any"
  | "not-in";

type StringKeyOf<T> = Extract<keyof T, string>;

// 4階層までのドットパス補完を出すための型
// 例: { auth: { memberships: string[] } } -> "auth" | "auth.memberships"
type DotFieldSecond<T extends Record<string, unknown>> = {
  [K in StringKeyOf<T>]: T[K] extends Record<string, unknown>
    ? `${K}.${StringKeyOf<T[K]>}`
    : never;
}[StringKeyOf<T>];

type DotFieldThird<T extends Record<string, unknown>> = {
  [K1 in StringKeyOf<T>]: T[K1] extends Record<string, unknown>
    ? {
        [K2 in StringKeyOf<T[K1]>]: T[K1][K2] extends Record<string, unknown>
          ? `${K1}.${K2}.${StringKeyOf<T[K1][K2]>}`
          : never;
      }[StringKeyOf<T[K1]>]
    : never;
}[StringKeyOf<T>];

type DotFieldFourth<T extends Record<string, unknown>> = {
  [K1 in StringKeyOf<T>]: T[K1] extends Record<string, unknown>
    ? {
        [K2 in StringKeyOf<T[K1]>]: T[K1][K2] extends Record<string, unknown>
          ? {
              [K3 in StringKeyOf<T[K1][K2]>]: T[K1][K2][K3] extends Record<
                string,
                unknown
              >
                ? `${K1}.${K2}.${K3}.${StringKeyOf<T[K1][K2][K3]>}`
                : never;
            }[StringKeyOf<T[K1][K2]>]
          : never;
      }[StringKeyOf<T[K1]>]
    : never;
}[StringKeyOf<T>];

type QueryField<T extends Record<string, unknown>> =
  | "doc_id"
  | StringKeyOf<T>
  | DotFieldSecond<T>
  | DotFieldThird<T>
  | DotFieldFourth<T>;

type FieldValue<
  T extends Record<string, unknown>,
  F extends QueryField<T>
> = F extends "doc_id"
  ? string
  : F extends `${infer K1}.${infer K2}.${infer K3}.${infer K4}`
  ? K1 extends StringKeyOf<T>
    ? T[K1] extends Record<string, unknown>
      ? K2 extends StringKeyOf<T[K1]>
        ? T[K1][K2] extends Record<string, unknown>
          ? K3 extends StringKeyOf<T[K1][K2]>
            ? T[K1][K2][K3] extends Record<string, unknown>
              ? K4 extends StringKeyOf<T[K1][K2][K3]>
                ? T[K1][K2][K3][K4]
                : never
              : never
            : never
          : never
        : never
      : never
    : never
  : F extends `${infer K1}.${infer K2}.${infer K3}`
  ? K1 extends StringKeyOf<T>
    ? T[K1] extends Record<string, unknown>
      ? K2 extends StringKeyOf<T[K1]>
        ? T[K1][K2] extends Record<string, unknown>
          ? K3 extends StringKeyOf<T[K1][K2]>
            ? T[K1][K2][K3]
            : never
          : never
        : never
      : never
    : never
  : F extends `${infer K1}.${infer K2}`
  ? K1 extends StringKeyOf<T>
    ? T[K1] extends Record<string, unknown>
      ? K2 extends StringKeyOf<T[K1]>
        ? T[K1][K2]
        : never
      : never
    : never
  : F extends StringKeyOf<T>
  ? T[F]
  : never;

type ElementIfArray<V> = V extends readonly (infer U)[] ? U : V;

type QueryFilter<T extends Record<string, unknown>> = {
  [F in QueryField<T>]:
    | {
        field: F;
        op: Exclude<
          WhereOp,
          "in" | "not-in" | "array-contains" | "array-contains-any"
        >;
        value: FieldValue<T, F>;
      }
    | {
        field: F;
        op: "in" | "not-in";
        value: FieldValue<T, F>[];
      }
    | {
        field: F;
        op: "array-contains";
        value: ElementIfArray<FieldValue<T, F>>;
      }
    | {
        field: F;
        op: "array-contains-any";
        value: ElementIfArray<FieldValue<T, F>>[];
      };
}[QueryField<T>];

// ファッキン黒魔術ここまで

type FirestoreDoc<T> = { doc_id: string } & T;

type Operator<T extends Record<string, unknown>> = {
  new: (value: T) => Promise<string>;
  set: (id: string, value: T) => Promise<void>;
  del: (id: string) => Promise<void>;
  get: (id: string) => Promise<T | null>;
  lis: (
    query: QueryFilter<T>[],
    limit?: number,
    offset?: number
  ) => Promise<FirestoreDoc<T>[]>;
};

const createSingleSchemeOperator = <T extends Record<string, unknown>>(
  db: FirestoreClient,
  collection: string,
  schema: ZodType<T>
): Operator<T> => ({
  new: async (value) => {
    const parsed = schema.parse(value);
    const id = generateRandomId(20);
    await db
      .collection(collection)
      .doc(id)
      .set({ doc_id: id, ...parsed });
    return id;
  },
  set: async (id, value) => {
    const parsed = schema.parse(value);
    await db
      .collection(collection)
      .doc(id)
      .set({ doc_id: id, ...parsed });
  },
  del: async (id) => {
    await db.collection(collection).doc(id).delete();
  },
  get: async (id) => {
    const snap = await db.collection(collection).doc(id).get();
    if (!snap.exists) return null;
    return schema.parse(snap.data());
  },
  lis: async (query, limit = DEFAULT_LIMIT, offset = 0) => {
    const results = (await db.query(collection, {
      where: query.map((q) => ({
        field: q.field as string,
        op: q.op,
        value: q.value,
      })),
      limit,
      offset,
    })) as unknown[];

    const firestoreDocSchema = z.looseObject({ doc_id: z.string() });

    return results.map((item) => {
      const record = firestoreDocSchema.parse(item);
      const parsed = schema.parse(record);
      return { doc_id: record.doc_id, ...parsed };
    });
  },
});

// Firestore操作の統一インターフェースをエクスポート
import {
  GroupRecordSchema,
  ScoutRecordSchema,
  UserRecordSchemaString,
} from "./schemas";

export const createOperator = (db: FirestoreClient) => ({
  users: createSingleSchemeOperator(db, "users", UserRecordSchemaString),
  groups: createSingleSchemeOperator(db, "groups", GroupRecordSchema),
  scouts: createSingleSchemeOperator(db, "scouts", ScoutRecordSchema),
});
