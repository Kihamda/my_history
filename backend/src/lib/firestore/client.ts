// Firestore REST API と通信するための軽量クライアント。
// ユーザーの ID トークンを用いて認可し、JSON のエンコード/デコードも担う。
import type { AppBindings } from "../../types/bindings";
import {
  decodeDocument,
  encodeDocument,
  type FirestoreValue,
} from "./converter";

const FIRESTORE_API_BASE = "https://firestore.googleapis.com/v1";

// クエリパラメータに許可する型。配列は同じキーで複数付与する。
type QueryValue = string | number | boolean | Array<string | number | boolean>;

interface FirestoreRequestOptions extends RequestInit {
  query?: Record<string, QueryValue | undefined>;
}

// Firestore REST API から返るドキュメントの生データ。
export interface FirestoreDocument<T = Record<string, unknown>> {
  name: string;
  createTime?: string;
  updateTime?: string;
  fields: Record<string, FirestoreValue>;
  parsed?: T;
}

// フルパスから末尾のドキュメント ID を取り出す。
const extractDocumentId = (fullName?: string): string => {
  if (!fullName) {
    return "";
  }
  const segments = fullName.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
};

// Firestore REST API を使った CRUD 操作をまとめたクラス。
class FirestoreRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
    readonly path: string
  ) {
    super(`Firestore request failed: ${status} ${body}`);
  }
}

export class FirestoreClient {
  constructor(
    private readonly env: AppBindings,
    private readonly idToken: string
  ) {}

  private get projectPath(): string {
    const projectId = this.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID is not configured");
    }
    // ここでベースのプロジェクトパスを作成することで、以降のメソッドが簡潔になる。
    return `/projects/${projectId}/databases/(default)`;
  }

  private get apiKey(): string {
    const key = this.env.FIREBASE_API_KEY;
    if (!key) {
      throw new Error("FIREBASE_API_KEY is not configured");
    }
    return key;
  }

  private buildUrl(
    path: string,
    query?: FirestoreRequestOptions["query"]
  ): string {
    // API ベースURLにパスを繋げ、必要に応じてクエリパラメータを付与する。
    const url = new URL(
      `${FIRESTORE_API_BASE}${path.startsWith("/") ? path : `/${path}`}`
    );
    url.searchParams.set("key", this.apiKey);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((entry) =>
              url.searchParams.append(key, String(entry))
            );
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }
    return url.toString();
  }

  private async authorizedFetch<T = unknown>(
    path: string,
    { headers, query, ...init }: FirestoreRequestOptions = {}
  ): Promise<T> {
    // 事前にサービスアカウントのアクセストークンを取得し Authorization ヘッダーへ付与。
    const response = await fetch(this.buildUrl(path, query), {
      ...init,
      headers: {
        Authorization: `Bearer ${this.idToken}`,
        "X-Goog-User-Project": this.env.FIREBASE_PROJECT_ID,
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new FirestoreRequestError(response.status, errorBody, path);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private documentsPath(collectionPath: string): string {
    // ドキュメントもしくはコレクションのフルパスを組み立てる。
    return `${this.projectPath}/documents/${collectionPath}`;
  }

  async getDocument<T = Record<string, unknown>>(
    documentPath: string
  ): Promise<T | null> {
    try {
      const doc = await this.authorizedFetch<FirestoreDocument>(
        this.documentsPath(documentPath)
      );
      return (doc && (decodeDocument(doc) as T)) ?? null;
    } catch (error) {
      if (error instanceof FirestoreRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async setDocument(
    documentPath: string,
    data: Record<string, unknown>,
    options?: { merge?: boolean; updateMask?: string[] }
  ): Promise<void> {
    // merge / updateMask を考慮しながら PATCH を発行する。
    const query: Record<string, QueryValue> = {};
    const masks =
      options?.updateMask ?? (options?.merge ? Object.keys(data) : []);
    if (masks.length) {
      query["updateMask.fieldPaths"] = masks;
    }
    await this.authorizedFetch(this.documentsPath(documentPath), {
      method: "PATCH",
      body: JSON.stringify(encodeDocument(data)),
      query,
    });
  }

  async deleteDocument(documentPath: string): Promise<void> {
    // ドキュメントを完全に削除する。
    await this.authorizedFetch(this.documentsPath(documentPath), {
      method: "DELETE",
    });
  }

  async listDocuments<T = Record<string, unknown>>(
    collectionPath: string,
    pageSize = 100
  ): Promise<Array<T & { id: string }>> {
    // コレクション内のドキュメント一覧を取得し、ID を付与して返す。
    try {
      const result = await this.authorizedFetch<{
        documents?: FirestoreDocument[];
      }>(this.documentsPath(collectionPath), {
        query: { pageSize },
      });

      return (result.documents ?? []).map((doc) => ({
        ...(decodeDocument(doc) as T),
        id: extractDocumentId(doc.name),
      }));
    } catch (error) {
      if (error instanceof FirestoreRequestError && error.status === 404) {
        return [];
      }
      throw error;
    }
  }
}
