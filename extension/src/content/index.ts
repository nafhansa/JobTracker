import type { AutofillData } from "@/lib/types";
import { detectATS, detectJobForm } from "./detector";
import { mapFields } from "./mapper";
import { fillFields, insertFillBadge } from "./filler";
import { greenhouseAdapter } from "./ats/greenhouse";
import { leverAdapter } from "./ats/lever";
import { workdayAdapter } from "./ats/workday";
import type { ATSAdapter } from "./ats/index";

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

const observer = new MutationObserver(() => {
  if (!currentFormDetected) {
    checkForJobForm();
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    checkForJobForm();
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  checkForJobForm();
  observer.observe(document.body, { childList: true, subtree: true });
}
