import { Scout } from "@/types/scout/scout";
import { getScoutData } from "./scout";
import { getObjectDiff } from "@/tools/getObjectDiff";

export type ConflictDetectionResult =
  | {
      status: "no-conflict";
      currentScout: Scout;
      userChanges: Record<string, any>;
    }
  | {
      status: "conflict";
      conflictFields: Record<string, any>;
      currentScout: Scout;
      userChanges: Record<string, any>;
    }
  | {
      status: "error";
      error: string;
    };

/**
 * スカウトデータの競合を検出する。
 *
 * 編集開始時のデータと現在のDBの状態を比較し、同時編集による競合を検出する。
 * この関数は検出のみを行い、データの保存は行わない。
 *
 * @param initialScout 編集を開始した時点のスカウトデータ
 * @param userChanges ユーザーが行った変更の差分
 * @returns 競合検出の結果。競合がない場合は現在のデータとユーザー変更を返し、
 *          競合がある場合は競合フィールドの詳細を返す。
 */
export const detectConflicts = async (
  initialScout: Scout,
  userChanges: Record<string, any>
): Promise<ConflictDetectionResult> => {
  try {
    const currentScout = await getScoutData(initialScout.id);
    if (!currentScout) {
      return { status: "error", error: "Scout data not found in DB." };
    }

    const serverChanges = getObjectDiff(initialScout, currentScout);

    // 競合チェック
    const conflictFields: Record<string, any> = {};
    for (const key in userChanges) {
      if (serverChanges.hasOwnProperty(key)) {
        conflictFields[key] = {
          serverChange: serverChanges[key],
          userChange: userChanges[key],
          initialValue: getNestedValue(initialScout, key),
          currentValue: getNestedValue(currentScout, key),
        };
      }
    }

    if (Object.keys(conflictFields).length > 0) {
      return {
        status: "conflict",
        conflictFields,
        currentScout,
        userChanges,
      };
    }

    return {
      status: "no-conflict",
      currentScout,
      userChanges,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { status: "error", error: errorMessage };
  }
};

/**
 * ネストしたオブジェクトから指定されたキーパスの値を取得する
 * @param obj オブジェクト
 * @param keyPath キーパス（例: "personal.name"）
 * @returns 値
 */
const getNestedValue = (obj: any, keyPath: string): any => {
  return keyPath.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};
