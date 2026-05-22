import browser from "webextension-polyfill";

export interface StoredAuth {
  uid: string;
  email: string | null;
  idToken: string;
  expiresAt: number;
}

const AUTH_KEY = "jt_auth";
const PROFILE_KEY = "jt_profile";
const PROFILE_CACHE_MS = 5 * 60 * 1000;

export async function getAuth(): Promise<StoredAuth | null> {
  const result = await browser.storage.local.get(AUTH_KEY);
  return (result[AUTH_KEY] as StoredAuth) || null;
}

export async function setAuth(auth: StoredAuth): Promise<void> {
  await browser.storage.local.set({ [AUTH_KEY]: auth });
}

export async function clearAuth(): Promise<void> {
  await browser.storage.local.remove(AUTH_KEY);
}

export async function getProfile(): Promise<Record<string, unknown> | null> {
  const result = await browser.storage.local.get(PROFILE_KEY);
  const stored = result[PROFILE_KEY] as { profile: Record<string, unknown>; cachedAt: number } | undefined;
  if (!stored) return null;
  if (Date.now() - stored.cachedAt > PROFILE_CACHE_MS) return null;
  return stored.profile;
}

export async function setProfile(profile: Record<string, unknown>): Promise<void> {
  await browser.storage.local.set({
    [PROFILE_KEY]: { profile, cachedAt: Date.now() },
  });
}

export async function clearProfile(): Promise<void> {
  await browser.storage.local.remove(PROFILE_KEY);
}

export async function clearAll(): Promise<void> {
  await browser.storage.local.remove([AUTH_KEY, PROFILE_KEY]);
}
