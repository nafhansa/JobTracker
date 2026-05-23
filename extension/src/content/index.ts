import type { AutofillData } from "./storage";
import { detectATS, detectJobForm } from "./detector";
import { mapFields, mapSingleField } from "./mapper";
import { fillFields, insertFillBadge } from "./filler";
import { greenhouseAdapter } from "./ats/greenhouse";
import { leverAdapter } from "./ats/lever";
import { workdayAdapter } from "./ats/workday";
import type { ATSAdapter } from "./ats/index";
import { readProfileFromStorage, watchStorageChanges } from "./storage";
import { showSuggestion, hideSuggestion, setProfile, getProfile } from "./inline-suggest";

const atsAdapters: ATSAdapter[] = [greenhouseAdapter, leverAdapter, workdayAdapter];

let currentFormDetected = false;
let inlineInitialized = false;
let fillingField = false;

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
  fillingField = true;
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

  setTimeout(() => { fillingField = false; }, 500);
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

let lastFocusInTime = 0;

function handleFocusIn(e: FocusEvent): void {
  lastFocusInTime = Date.now();
  const target = e.target;
  if (!isFillableInput(target)) return;

  const input = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  if (input.value && input.value.trim() !== "") {
    hideSuggestion();
    return;
  }

  const data = getProfile();
  if (!data) return;

  const match = mapSingleField(input, data);
  if (!match) return;

  if (!match) return;

  const value = (data[match.profileKey] as string) || "";
  if (!value) return;

  showSuggestion(input, value);
}

function handleFocusOut(_e: FocusEvent): void {
  setTimeout(() => {
    if (Date.now() - lastFocusInTime < 200) return;
    const host = document.getElementById("jt-autofill-pill-host");
    if (!host) return;
    const active = document.activeElement;
    if (active && host.contains(active)) return;
    hideSuggestion();
  }, 150);
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    hideSuggestion();
  }
}

function handleInput(): void {
  if (fillingField) return;
  hideSuggestion();
}

window.addEventListener("jt-autofill-filling", ((e: CustomEvent) => {
  fillingField = e.detail as boolean;
}) as EventListener);

async function initInlineSuggestions(): Promise<void> {
  if (inlineInitialized) return;
  if (document.getElementById("jt-autofill-initialized")) return;
  inlineInitialized = true;

  const marker = document.createElement("div");
  marker.id = "jt-autofill-initialized";
  marker.style.display = "none";
  document.body.appendChild(marker);

  const profile = await readProfileFromStorage();
  setProfile(profile);

  watchStorageChanges((updated) => {
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
