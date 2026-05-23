import browser from "webextension-polyfill";
import { getAuth, setAuth, clearAuth, clearProfile } from "./storage";

const API_BASE = "https://jobtracker.id";
const APP_ORIGINS = ["https://jobtracker.id/*", "http://localhost:*/*"];

export async function fetchProfile(): Promise<Record<string, unknown> | null> {
  const auth = await getAuth();
  if (!auth) return null;

  if (Date.now() > auth.expiresAt) {
    await clearAuth();
    await clearProfile();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/ai/profile`, {
      headers: { Authorization: `Bearer ${auth.idToken}` },
    });
    if (res.status === 401) {
      await clearAuth();
      await clearProfile();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isMissingReceiverError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Receiving end does not exist|Could not establish connection/i.test(
    error.message
  );
}

async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["assets/content.js"],
    });
    return true;
  } catch {
    return false;
  }
}

async function sendMessageWithRetry<T>(
  tabId: number,
  message: unknown
): Promise<T | null> {
  try {
    return (await browser.tabs.sendMessage(tabId, message)) as T;
  } catch (error) {
    if (!isMissingReceiverError(error)) return null;

    const injected = await ensureContentScript(tabId);
    if (!injected) return null;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return (await browser.tabs.sendMessage(tabId, message)) as T;
      } catch (retryError) {
        if (!isMissingReceiverError(retryError)) return null;
        await new Promise((r) => setTimeout(r, 150));
      }
    }
    return null;
  }
}

export async function readTokenFromAppTab(): Promise<{
  idToken: string;
  uid: string;
  email: string;
} | null> {
  const tabs = await browser.tabs.query({ url: APP_ORIGINS });

  for (const tab of tabs) {
    if (!tab.id) continue;

    const response = await sendMessageWithRetry<{
      idToken: string | null;
      uid: string | null;
      email: string | null;
    }>(tab.id, { type: "GET_AUTH_TOKEN" });

    if (response?.idToken && response?.uid) {
      return {
        idToken: response.idToken,
        uid: response.uid,
        email: response.email || "",
      };
    }
  }

  return null;
}

export async function openAppTab(): Promise<void> {
  const existing = await browser.tabs.query({ url: APP_ORIGINS });
  if (existing.length > 0 && existing[0].id) {
    await browser.tabs.update(existing[0].id, { active: true });
    await browser.windows.update(existing[0].windowId, { focused: true });
    return;
  }
  await browser.tabs.create({ url: `${API_BASE}/login` });
}

export async function storeAuthFromToken(tokenData: {
  idToken: string;
  uid: string;
  email: string;
}): Promise<void> {
  const payload = JSON.parse(atob(tokenData.idToken.split(".")[1]));
  const expiresAt = (payload.exp as number) * 1000;
  await setAuth({
    uid: tokenData.uid,
    email: tokenData.email,
    idToken: tokenData.idToken,
    expiresAt,
  });
}
