// ログインユーザーのプロフィール／設定を返却・更新するルーター。
import { Hono } from "hono";
import type { Context } from "hono";
import { FirebaseAuthError } from "../firebase";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";
import {
  getUserSettings,
  updateUserSettings,
} from "../repositories/usersRepository";
import { getCurrentGroupContext } from "../repositories/groupsRepository";
import type {
  UserDocument,
  UserNotificationSettings,
  UserPreferences,
  UserSettingsResponse,
} from "../types/domain/user";

type RouterContext = Context<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>;

// 不正な入力を検知した際に一貫したメッセージで 400 を返す。
const invalidPayload = (field: string): FirebaseAuthError =>
  new FirebaseAuthError(`Invalid payload: ${field}`, 400, "INVALID_PAYLOAD");

// JSON パースをまとめて行い、失敗時は 400 エラーに変換する。
const parseJsonBody = async <T>(c: RouterContext): Promise<T> => {
  try {
    return (await c.req.json()) as T;
  } catch (error) {
    console.warn("Failed to parse JSON payload", error);
    throw new FirebaseAuthError("INVALID_JSON", 400, "INVALID_JSON");
  }
};

// 真偽値でなければ 400 を返すユーティリティ。
const sanitizeBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") {
    throw invalidPayload(field);
  }
  return value;
};

const sanitizeOptionalBoolean = (
  value: unknown,
  field: string
): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return sanitizeBoolean(value, field);
};

// 通知設定オブジェクトを厳密に検証する。
const sanitizeNotifications = (value: unknown): UserNotificationSettings => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload("preferences.notifications");
  }

  const input = value as Record<string, unknown>;
  const notifications: UserNotificationSettings = {};

  if ("email" in input) {
    notifications.email = sanitizeOptionalBoolean(
      input.email,
      "preferences.notifications.email"
    );
  }

  if ("push" in input) {
    notifications.push = sanitizeOptionalBoolean(
      input.push,
      "preferences.notifications.push"
    );
  }

  if ("line" in input) {
    notifications.line = sanitizeOptionalBoolean(
      input.line,
      "preferences.notifications.line"
    );
  }

  if ("digestHour" in input) {
    const digestHour = input.digestHour;
    if (digestHour === null || digestHour === undefined) {
      notifications.digestHour = undefined;
    } else if (
      typeof digestHour === "number" &&
      Number.isInteger(digestHour) &&
      digestHour >= 0 &&
      digestHour <= 23
    ) {
      notifications.digestHour = digestHour;
    } else {
      throw invalidPayload("preferences.notifications.digestHour");
    }
  }

  return notifications;
};

// 言語・タイムゾーン・テーマなどの設定を検証し、許容されない値を排除する。
const sanitizePreferences = (value: unknown): UserPreferences => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidPayload("preferences");
  }

  const input = value as Record<string, unknown>;
  const preferences: UserPreferences = {};

  if ("locale" in input) {
    const locale = input.locale;
    if (locale === null || locale === undefined) {
      // omit
    } else if (typeof locale === "string") {
      preferences.locale = locale;
    } else {
      throw invalidPayload("preferences.locale");
    }
  }

  if ("timezone" in input) {
    const timezone = input.timezone;
    if (timezone === null || timezone === undefined) {
      // omit
    } else if (typeof timezone === "string") {
      preferences.timezone = timezone;
    } else {
      throw invalidPayload("preferences.timezone");
    }
  }

  if ("theme" in input) {
    const theme = input.theme;
    if (theme === null || theme === undefined) {
      // omit
    } else if (theme === "light" || theme === "dark" || theme === "system") {
      preferences.theme = theme;
    } else {
      throw invalidPayload("preferences.theme");
    }
  }

  if ("notifications" in input) {
    const notifications = input.notifications;
    if (notifications === null || notifications === undefined) {
      // omit
    } else {
      preferences.notifications = sanitizeNotifications(notifications);
    }
  }

  return preferences;
};

// `/me` 更新時の入力検証。部分更新なので存在するキーだけをチェックする。
const sanitizeUserUpdate = (payload: unknown): Partial<UserDocument> => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidPayload("body");
  }

  const input = payload as Record<string, unknown>;
  const update: Partial<UserDocument> = {};

  if ("displayName" in input) {
    const displayName = input.displayName;
    if (displayName === null || displayName === undefined) {
      update.displayName = undefined;
    } else if (typeof displayName === "string") {
      update.displayName = displayName;
    } else {
      throw invalidPayload("displayName");
    }
  }

  if ("joinGroupId" in input) {
    const joinGroupId = input.joinGroupId;
    if (joinGroupId === null) {
      update.joinGroupId = null;
    } else if (joinGroupId === undefined) {
      // omit
    } else if (typeof joinGroupId === "string") {
      update.joinGroupId = joinGroupId.trim() === "" ? null : joinGroupId;
    } else {
      throw invalidPayload("joinGroupId");
    }
  }

  if ("knownScoutIds" in input) {
    const knownScoutIds = input.knownScoutIds;
    if (knownScoutIds === null || knownScoutIds === undefined) {
      update.knownScoutIds = [];
    } else if (
      Array.isArray(knownScoutIds) &&
      knownScoutIds.every((item) => typeof item === "string")
    ) {
      update.knownScoutIds = knownScoutIds;
    } else {
      throw invalidPayload("knownScoutIds");
    }
  }

  if ("photoURL" in input) {
    const photoURL = input.photoURL;
    if (photoURL === null || photoURL === undefined) {
      update.photoURL = undefined;
    } else if (typeof photoURL === "string") {
      update.photoURL = photoURL;
    } else {
      throw invalidPayload("photoURL");
    }
  }

  if ("preferences" in input) {
    const preferences = input.preferences;
    if (preferences === null || preferences === undefined) {
      update.preferences = {};
    } else {
      update.preferences = sanitizePreferences(preferences);
    }
  }

  return update;
};

// レスポンス共通化のため、ユーザー本体・設定・所属情報をまとめて構築する。
const buildUserProfilePayload = async (
  c: RouterContext,
  settingsOverride?: UserSettingsResponse
) => {
  const auth = c.get("auth");
  const settings =
    settingsOverride ?? (await getUserSettings(c.env, auth.token, auth.user));

  const currentGroup = await getCurrentGroupContext(
    c.env,
    auth.token,
    settings.joinGroupId,
    auth.user.email
  );

  return {
    user: {
      uid: auth.user.uid,
      email: auth.user.email,
      emailVerified: auth.user.emailVerified,
      displayName: settings.displayName ?? auth.user.displayName ?? undefined,
      photoURL: settings.photoURL ?? auth.user.photoURL ?? undefined,
      providerIds: auth.user.providerIds,
      customClaims: auth.user.customClaims ?? {},
    },
    settings,
    currentGroup,
  };
};

const usersRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

  // すべてのエンドポイントで ID トークン検証を必須にする。
  .use("*", requireAuth)

  // ユーザー情報と設定をまとめて返す。
  .get("/me", async (c) => {
    const payload = await buildUserProfilePayload(c);
    return c.json(payload);
  })

  // ユーザー設定を更新し、反映後の状態を返す。
  .put("/me", async (c) => {
    const body = await parseJsonBody<unknown>(c);
    const update = sanitizeUserUpdate(body);

    if (!Object.keys(update).length) {
      throw new FirebaseAuthError("EMPTY_UPDATE", 400, "EMPTY_UPDATE");
    }

    const auth = c.get("auth");
    await updateUserSettings(c.env, auth.user.uid, auth.token, update);

    const refreshedSettings = await getUserSettings(
      c.env,
      auth.token,
      auth.user
    );
    const payload = await buildUserProfilePayload(c, refreshedSettings);
    return c.json(payload);
  });

export default usersRouter;
