import type { ISODateString } from "./common";

export interface UserNotificationSettings {
  email?: boolean;
  push?: boolean;
  line?: boolean;
  digestHour?: number;
}

export type ThemePreference = "light" | "dark" | "system";

export interface UserPreferences {
  locale?: string;
  timezone?: string;
  theme?: ThemePreference;
  notifications?: UserNotificationSettings;
}

export interface UserDocument {
  displayName?: string;
  joinGroupId?: string | null;
  knownScoutIds?: string[];
  photoURL?: string;
  preferences?: UserPreferences;
  migratedFromLegacy?: boolean;
  lastSeenAt?: ISODateString;
}

export interface UserSettingsResponse {
  uid: string;
  email?: string;
  displayName?: string;
  joinGroupId?: string | null;
  knownScoutIds: string[];
  preferences: UserPreferences;
  photoURL?: string;
  updatedAt?: ISODateString;
}
