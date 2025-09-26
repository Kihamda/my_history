// ユーザー設定ドキュメントの読み書きを担うリポジトリ層。
import { FirestoreClient } from "../lib/firestore";
import type { AppBindings } from "../types/bindings";
import type {
  UserDocument,
  UserPreferences,
  UserSettingsResponse,
} from "../types/domain/user";
import type { FirebaseAuthUser } from "../firebase";

const USERS_COLLECTION = "users";

const buildClient = (env: AppBindings, idToken: string) =>
  new FirestoreClient(env, idToken);

// Firestore に保存されていないフィールドがあってもハンドラで扱いやすいように初期値を補完する。
const normalizeUserDocument = (doc?: UserDocument | null): UserDocument => ({
  displayName: doc?.displayName,
  joinGroupId: doc?.joinGroupId ?? null,
  knownScoutIds: doc?.knownScoutIds ?? [],
  photoURL: doc?.photoURL,
  preferences: doc?.preferences ?? {},
  lastSeenAt: doc?.lastSeenAt,
  migratedFromLegacy: doc?.migratedFromLegacy,
});

export const getUserSettings = async (
  env: AppBindings,
  idToken: string,
  authUser: FirebaseAuthUser
): Promise<UserSettingsResponse> => {
  // Firestore から設定を取得し、認証情報で補完したレスポンスを返す。
  const client = buildClient(env, idToken);
  const doc = await client.getDocument<UserDocument>(
    `${USERS_COLLECTION}/${authUser.uid}`
  );

  const normalized = normalizeUserDocument(doc ?? undefined);

  return {
    uid: authUser.uid,
    email: authUser.email,
    displayName: normalized.displayName ?? authUser.displayName,
    joinGroupId: normalized.joinGroupId ?? null,
    knownScoutIds: normalized.knownScoutIds ?? [],
    preferences: normalized.preferences ?? ({} as UserPreferences),
    photoURL: normalized.photoURL ?? authUser.photoURL,
    updatedAt: normalized.lastSeenAt,
  };
};

export const updateUserSettings = async (
  env: AppBindings,
  uid: string,
  idToken: string,
  payload: Partial<UserDocument>
): Promise<void> => {
  // 最終更新日時を自動付与しつつ、差分更新で書き戻す。
  const client = buildClient(env, idToken);
  const update: UserDocument = {
    ...payload,
    lastSeenAt: new Date().toISOString(),
  };
  await client.setDocument(
    `${USERS_COLLECTION}/${uid}`,
    update as Record<string, unknown>,
    {
      merge: true,
    }
  );
};
