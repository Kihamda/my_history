import { Timestamp } from "firebase/firestore";

/**
 * FirestoreのTimestampオブジェクトを再帰的にJavaScriptのDateオブジェクトに変換する
 * @param data 変換対象のデータ
 * @returns TimestampがDateに変換されたデータ
 */
const convertTimestampsDate = (data: any): any => {
  if (!data) {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate();
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestampsDate(item));
  }

  if (typeof data === "object" && data !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = convertTimestampsDate(data[key]);
      }
    }
    return newObj;
  }

  return data;
};
export default convertTimestampsDate;
