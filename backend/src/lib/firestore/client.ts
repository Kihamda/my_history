import type { AppBindings } from "../../types/bindings";
import { getServiceAccountAccessToken } from "../googleAccessToken";
import {
  decodeDocument,
  encodeDocument,
  type FirestoreValue,
} from "./converter";

const FIRESTORE_API_BASE = "https://firestore.googleapis.com/v1";

type QueryValue = string | number | boolean | Array<string | number | boolean>;

interface FirestoreRequestOptions extends RequestInit {
  query?: Record<string, QueryValue | undefined>;
}

export interface FirestoreDocument<T = Record<string, unknown>> {
  name: string;
  createTime?: string;
  updateTime?: string;
  fields: Record<string, FirestoreValue>;
  parsed?: T;
}

const extractDocumentId = (fullName?: string): string => {
  if (!fullName) {
    return "";
  }
  const segments = fullName.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
};

export class FirestoreClient {
  constructor(private readonly env: AppBindings) {}

  private get projectPath(): string {
    const projectId = this.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID is not configured");
    }
    return `/projects/${projectId}/databases/(default)`;
  }

  private buildUrl(
    path: string,
    query?: FirestoreRequestOptions["query"]
  ): string {
    const url = new URL(
      `${FIRESTORE_API_BASE}${path.startsWith("/") ? path : `/${path}`}`
    );
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
    const token = await getServiceAccountAccessToken(this.env);
    const response = await fetch(this.buildUrl(path, query), {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Firestore request failed: ${response.status} ${errorBody}`
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private documentsPath(collectionPath: string): string {
    return `${this.projectPath}/documents/${collectionPath}`;
  }

  async getDocument<T = Record<string, unknown>>(
    documentPath: string
  ): Promise<T | null> {
    const doc = await this.authorizedFetch<FirestoreDocument>(
      this.documentsPath(documentPath)
    );
    return (doc && (decodeDocument(doc) as T)) ?? null;
  }

  async setDocument(
    documentPath: string,
    data: Record<string, unknown>,
    options?: { merge?: boolean; updateMask?: string[] }
  ): Promise<void> {
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

  async createDocument(
    parentPath: string,
    data: Record<string, unknown>,
    documentId?: string
  ): Promise<void> {
    const query = documentId ? { documentId } : undefined;
    await this.authorizedFetch(this.documentsPath(parentPath), {
      method: "POST",
      body: JSON.stringify(encodeDocument(data)),
      query,
    });
  }

  async deleteDocument(documentPath: string): Promise<void> {
    await this.authorizedFetch(this.documentsPath(documentPath), {
      method: "DELETE",
    });
  }

  async commit(body: unknown): Promise<void> {
    await this.authorizedFetch(`${this.projectPath}/documents:commit`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async batchGet<T = Record<string, unknown>>(
    documentPaths: string[]
  ): Promise<T[]> {
    const results = await this.authorizedFetch<
      Array<{ found?: FirestoreDocument }>
    >(`${this.projectPath}/documents:batchGet`, {
      method: "POST",
      body: JSON.stringify({
        documents: documentPaths.map(
          (path) => `${this.projectPath}/documents/${path}`
        ),
      }),
    });

    return results
      .filter((item) => item.found)
      .map((item) => decodeDocument(item.found!) as T);
  }

  async runQuery<T = Record<string, unknown>>(
    body: unknown,
    parentPath?: string
  ): Promise<Array<T & { id: string }>> {
    const endpoint = parentPath
      ? `${this.projectPath}/documents/${parentPath}:runQuery`
      : `${this.projectPath}/documents:runQuery`;

    const results = await this.authorizedFetch<
      Array<{ document?: FirestoreDocument }>
    >(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return results
      .filter((item) => item.document)
      .map((item) => ({
        ...(decodeDocument(item.document!) as T),
        id: extractDocumentId(item.document?.name),
      }));
  }

  async listDocuments<T = Record<string, unknown>>(
    collectionPath: string,
    pageSize = 100
  ): Promise<Array<T & { id: string }>> {
    const result = await this.authorizedFetch<{
      documents?: FirestoreDocument[];
    }>(this.documentsPath(collectionPath), {
      query: { pageSize },
    });

    return (result.documents ?? []).map((doc) => ({
      ...(decodeDocument(doc) as T),
      id: extractDocumentId(doc.name),
    }));
  }
}
