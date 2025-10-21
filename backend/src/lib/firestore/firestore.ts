import { createFirestoreClient } from "firebase-rest-firestore";
import { createMiddleware } from "hono/factory";

export const firestoreMiddleware = createMiddleware(async (c, next) => {
  const firestore = createFirestoreClient({
    projectId: c.env.PROJECT_ID,
    clientEmail: c.env.FIREBASE_CLIENT_EMAIL,
    privateKey: c.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  });
  c.set("db", firestore);
  await next();
});

export type FirestoreReturn<T> = {
  id: string;
} & T;
