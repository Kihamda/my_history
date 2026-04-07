import { createFirestoreClient } from "firebase-rest-firestore";
import { createMiddleware } from "hono/factory";
import { createOperator } from "./operator";

type FirestoreEnv = {
  PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_SERVICE_ACCOUNT_KEY: string;
};

type FirestoreClient = ReturnType<typeof createOperator>;

// Firestoreクライアントのキャッシュ（非null保証はgetDbを通して提供）
let cached: { key: string; client: FirestoreClient } | null = null;

const ensureFirestoreOperator = (env: FirestoreEnv): FirestoreClient => {
  const currentKey = `${env.PROJECT_ID}:${env.FIREBASE_CLIENT_EMAIL}`;
  if (cached && cached.key === currentKey) {
    return cached.client;
  }

  const client = createOperator(
    createFirestoreClient({
      projectId: env.PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_SERVICE_ACCOUNT_KEY,
    }),
  );

  cached = { key: currentKey, client };
  return client;
};

export const firestoreMiddleware = createMiddleware(async (c, next) => {
  ensureFirestoreOperator(c.env);
  await next();
});

export const db = (): FirestoreClient => {
  if (!cached) {
    throw new Error("Firestore client not initialized yet");
  }
  return cached.client;
};
