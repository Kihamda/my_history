// Firestore REST API の JSON 形式とアプリ内部の値を相互変換するユーティリティ。
type FirestorePrimitive =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } };

export type FirestoreValue =
  | FirestorePrimitive
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values: FirestoreValue[] } };

// `Date` や配列を除く純粋なオブジェクトかどうかを判定する。
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

// JavaScript の値を Firestore REST API の `Value` 形式へ変換する。
export const encodeValue = (value: unknown): FirestoreValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return { nullValue: null };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value
          .map((item) => encodeValue(item))
          .filter((item): item is FirestoreValue => item !== undefined),
      },
    };
  }

  if (isPlainObject(value)) {
    const fields: Record<string, FirestoreValue> = {};
    for (const [key, val] of Object.entries(value)) {
      const encoded = encodeValue(val);
      if (encoded !== undefined) {
        fields[key] = encoded;
      }
    }
    return { mapValue: { fields } };
  }

  throw new Error(`Unsupported Firestore value: ${JSON.stringify(value)}`);
};

// Firestore REST API の `Value` 形式を素の JavaScript 値に戻す。
export const decodeValue = (value: FirestoreValue): unknown => {
  if ("nullValue" in value) {
    return null;
  }
  if ("booleanValue" in value) {
    return value.booleanValue;
  }
  if ("integerValue" in value) {
    return Number.parseInt(value.integerValue, 10);
  }
  if ("doubleValue" in value) {
    return value.doubleValue;
  }
  if ("timestampValue" in value) {
    return value.timestampValue;
  }
  if ("stringValue" in value) {
    return value.stringValue;
  }
  if ("bytesValue" in value) {
    return value.bytesValue;
  }
  if ("referenceValue" in value) {
    return value.referenceValue;
  }
  if ("geoPointValue" in value) {
    return value.geoPointValue;
  }
  if ("mapValue" in value) {
    const result: Record<string, unknown> = {};
    for (const [key, fieldValue] of Object.entries(
      value.mapValue.fields ?? {}
    )) {
      result[key] = decodeValue(fieldValue);
    }
    return result;
  }
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => decodeValue(item));
  }
  return undefined;
};

export const encodeDocument = (
  data: Record<string, unknown>
): {
  fields: Record<string, FirestoreValue>;
} => {
  // Firestore へ送信する際は mapValue 配下にフィールドを詰める必要がある。
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(data)) {
    const encoded = encodeValue(value);
    if (encoded !== undefined) {
      fields[key] = encoded;
    }
  }
  return { fields };
};

export const decodeDocument = (document: {
  fields?: Record<string, FirestoreValue>;
}): Record<string, unknown> => {
  // Firestore から返却されたドキュメントをアプリ内部の形に戻す。
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document.fields ?? {})) {
    result[key] = decodeValue(value);
  }
  return result;
};
