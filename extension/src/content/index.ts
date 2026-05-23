import type { AutofillData } from "@/lib/types";
import { detectATS, detectJobForm } from "./detector";
import { mapFields, mapSingleField } from "./mapper";
import { fillFields, insertFillBadge } from "./filler";
import { greenhouseAdapter } from "./ats/greenhouse";
import { leverAdapter } from "./ats/lever";
import { workdayAdapter } from "./ats/workday";
import type { ATSAdapter } from "./ats/index";
import { readProfileFromStorage, watchStorageChanges } from "./storage";
import { showSuggestion, hideSuggestion, setProfile } from "./inline-suggest";

const atsAdapters: ATSAdapter[] = [greenhouseAdapter, leverAdapter, workdayAdapter];

let currentFormDetected = false;

function checkForJobForm(): void {
  const ats = detectATS(window.location.href);
  const isJobForm = detectJobForm(document);

  if (ats || isJobForm) {
    currentFormDetected = true;
    chrome.runtime.sendMessage({ type: "FORM_DETECTED", ats });
  }
}

async function handleFillForm(data: AutofillData): Promise<{
  filledCount: number;
  fields: string[];
}> {
  let adapter: ATSAdapter | null = null;

  for (const a of atsAdapters) {
    if (a.detect()) {
      adapter = a;
      break;
    }
  }

  if (adapter) {
    const form = adapter.getForm();
    if (form) {
      const mapped = adapter.mapFields(data);
      const result = fillFields(mapped, data);
      if (result.filledCount > 0) {
        insertFillBadge(result.filledCount);
      }
      return result;
    }
  }

  const forms = document.querySelectorAll("form");
  let bestResult = { filledCount: 0, fields: [] as string[] };

  for (const form of forms) {
    const mapped = mapFields(form, data);
    const result = fillFields(mapped, data);
    if (result.filledCount > bestResult.filledCount) {
      bestResult = result;
    }
  }

  if (bestResult.filledCount === 0 && forms.length === 0) {
    const mapped = mapFields(document.body, data);
    const result = fillFields(mapped, data);
    bestResult = result;
  }

  if (bestResult.filledCount > 0) {
    insertFillBadge(bestResult.filledCount);
  }

  return bestResult;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const msg = message as { type: string; data?: AutofillData };

  if (msg.type === "FILL_FORM" && msg.data) {
    handleFillForm(msg.data).then(sendResponse);
    return true;
  }

  if (msg.type === "CHECK_FORM") {
    sendResponse({ detected: currentFormDetected, ats: detectATS(window.location.href) });
    return true;
  }

  if (msg.type === "GET_AUTH_TOKEN") {
    sendResponse({
      idToken: localStorage.getItem("jt_ext_id_token"),
      uid: localStorage.getItem("jt_ext_uid"),
      email: localStorage.getItem("jt_ext_email"),
    });
    return true;
  }

  return false;
});

function isFillableInput(
  el: EventTarget | null
): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement) && !(el instanceof HTMLSelectElement)) {
    return false;
  }
  if (el.type === "hidden" || el.type === "submit" || el.type === "button" || el.type === "file" || el.type === "password" || el.type === "checkbox" || el.type === "radio") {
    return false;
  }
  if (el.disabled || el.readOnly) return false;
  return true;
}

function handleFocusIn(e: FocusEvent): void {
  const target = e.target;
  if (!isFillableInput(target)) return;

  const profile = showSuggestion.length > 0 ? readProfileFromStorage : null;

  const input = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  if (input.value && input.value.trim() !== "") {
    hideSuggestion();
    return;
  }

  const data = getInlineProfile();
  if (!data) return;

  const match = mapSingleField(input, data);
  if (!match) return;

  const value = (data[match.profileKey] as string) || "";
  if (!value) return;

  showSuggestion(input, value);
}

function handleFocusOut(e: FocusEvent): void {
  if (e.relatedTarget) {
    const host = document.getElementById("jt-autofill-pill-host");
    if (host && host.shadowRoot && host.shadowRoot.contains(e.relatedTarget as Node)) {
      return;
    }
  }
  setTimeout(() => {
    const host = document.getElementById("jt-autofill-pill-host");
    if (!host) return;
    if (host.shadowRoot && host.shadowRoot.contains(document.activeElement)) return;
    hideSuggestion();
  }, 150);
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    hideSuggestion();
  }
}

function handleInput(): void {
  hideSuggestion();
}

let _inlineProfile: AutofillData | null = null;

function getInlineProfile(): AutofillData | null {
  return _inlineProfile;
}

async function initInlineSuggestions(): Promise<void> {
  const profile = await readProfileFromStorage();
  _inlineProfile = profile;
  setProfile(profile);

  watchStorageChanges((updated) => {
    _inlineProfile = updated;
    setProfile(updated);
  });

  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("focusout", handleFocusOut, true);
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("input", handleInput, true);
}

const observer = new MutationObserver(() => {
  if (!currentFormDetected) {
    checkForJobForm();
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    checkForJobForm();
    observer.observe(document.body, { childList: true, subtree: true });
    initInlineSuggestions();
  });
} else {
  checkForJobForm();
  observer.observe(document.body, { childList: true, subtree: true });
  initInlineSuggestions();
}
