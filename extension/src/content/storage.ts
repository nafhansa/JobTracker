import type { AutofillData, UserProfile } from "@/lib/types";
import { profileToAutofill } from "@/lib/types";

const PROFILE_KEY = "jt_profile";

export async function readProfileFromStorage(): Promise<AutofillData | null> {
  try {
    const result = await chrome.storage.local.get(PROFILE_KEY);
    const stored = result[PROFILE_KEY] as {
      profile: Record<string, unknown>;
      cachedAt: number;
    } | undefined;

    if (!stored || !stored.profile) return null;

    return profileToAutofill(stored.profile as unknown as UserProfile);
  } catch {
    return null;
  }
}

export function watchStorageChanges(
  callback: (profile: AutofillData | null) => void
): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(PROFILE_KEY in changes)) return;

    const newValue = changes[PROFILE_KEY].newValue as {
      profile: Record<string, unknown>;
      cachedAt: number;
    } | undefined;

    if (!newValue || !newValue.profile) {
      callback(null);
      return;
    }

    callback(profileToAutofill(newValue.profile as unknown as UserProfile));
  });
}
