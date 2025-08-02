import { isEqual } from "lodash";

/**
 * 2つのオブジェクトを比較し、差分のあるキーと値を返す。
 * ネストされたオブジェクトや配列も再帰的に比較する。
 *
 * @param obj1 比較元のオブジェクト
 * @param obj2 比較先のオブジェクト
 * @returns 差分が含まれる新しいオブジェクト
 */
export const getObjectDiff = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): Record<string, any> => {
  const diff: Record<string, any> = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach((key) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (!isEqual(val1, val2)) {
      if (
        typeof val1 === "object" &&
        val1 !== null &&
        typeof val2 === "object" &&
        val2 !== null &&
        !Array.isArray(val1) &&
        !Array.isArray(val2)
      ) {
        const nestedDiff = getObjectDiff(val1, val2);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else {
        diff[key] = val2;
      }
    }
  });

  return diff;
};

export default getObjectDiff;
