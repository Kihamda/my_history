import { FirestoreClient } from "../lib/firestore";
import type { AppBindings } from "../types/bindings";
import type {
  UserDocument,
  UserPreferences,
  UserSettingsResponse,
} from "../types/domain/user";
import type { FirebaseAuthUser } from "../firebase";

const USERS_COLLECTION = "users";

const buildClient = (env: AppBindings) => new FirestoreClient(env);

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
  authUser: FirebaseAuthUser
): Promise<UserSettingsResponse> => {
  const client = buildClient(env);
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
  payload: Partial<UserDocument>
): Promise<void> => {
  const client = buildClient(env);
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
