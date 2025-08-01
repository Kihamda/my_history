const getObjectDiff = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): Record<string, any> => {
  const diff: Record<string, any> = {};

  // 全てのキーを取得
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    const value1 = obj1[key];
    const value2 = obj2[key];

    // 配列の場合の処理
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        diff[key] = { old: value1, new: value2 };
      }
    }
    // Dateオブジェクトの場合の処理
    else if (value1 instanceof Date && value2 instanceof Date) {
      if (value1.getTime() !== value2.getTime()) {
        diff[key] = { old: value1, new: value2 };
      }
    }
    // nullまたはundefinedが含まれる場合
    else if (
      value1 === null ||
      value1 === undefined ||
      value2 === null ||
      value2 === undefined
    ) {
      if (value1 !== value2) {
        diff[key] = { old: value1, new: value2 };
      }
    }
    // 両方がオブジェクトの場合（nullではない）
    else if (
      typeof value1 === "object" &&
      value1 !== null &&
      typeof value2 === "object" &&
      value2 !== null &&
      !Array.isArray(value1) &&
      !Array.isArray(value2) &&
      !(value1 instanceof Date) &&
      !(value2 instanceof Date)
    ) {
      const nestedDiff = getObjectDiff(value1, value2);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    }
    // プリミティブ値や型が異なる場合
    else if (value1 !== value2) {
      diff[key] = { old: value1, new: value2 };
    }
  }

  return diff;
};

export default getObjectDiff;
