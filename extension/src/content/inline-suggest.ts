import type { AutofillData } from "./storage";
import { setNativeValue, highlightElement } from "./filler";

const PILL_ID = "jt-autofill-pill";
const SHADOW_HOST_ID = "jt-autofill-pill-host";
const DISMISS_TIMEOUT = 6000;

let currentInput:
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement
  | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let cachedProfile: AutofillData | null = null;

const TIE_SVG = `<svg width="14" height="14" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="jtpg" x1="256" y1="80" x2="256" y2="460" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="#0099FF"/><stop offset="40%" stop-color="#0066CC"/><stop offset="100%" stop-color="#1A2A6C"/>
  </linearGradient></defs>
  <path d="M150 80L190 140 210 110Z" fill="url(#jtpg)"/>
  <path d="M362 80L322 140 302 110Z" fill="url(#jtpg)"/>
  <path d="M220 110L292 110 276 165 236 165Z" fill="url(#jtpg)"/>
  <path d="M234 180L278 180 320 400 256 465 192 400Z" fill="url(#jtpg)"/>
</svg>`;

export function setProfile(profile: AutofillData | null): void {
  cachedProfile = profile;
}

export function showSuggestion(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  const existing = document.getElementById(SHADOW_HOST_ID);
  if (existing) existing.remove();
  currentInput = input;

  const host = document.createElement("div");
  host.id = SHADOW_HOST_ID;
  host.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;top:0;left:0;width:0;height:0;";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .pill {
      position: fixed;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      background: #FFFFFF;
      border: 1px solid #E2E4F0;
      border-left: 3px solid #3B82F6;
      border-radius: 8px;
      box-shadow: 0 3px 12px rgba(59,130,246,0.12), 0 1px 3px rgba(0,0,0,0.06);
      cursor: pointer;
      pointer-events: auto;
      max-width: 280px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: jt-fadein 0.15s ease-out;
      transition: background 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
    }
    .pill:hover {
      background: #F0F5FF;
      border-color: #BFDBFE;
      border-left-color: #1D4ED8;
      box-shadow: 0 4px 16px rgba(59,130,246,0.18), 0 1px 4px rgba(0,0,0,0.08);
    }
    .pill-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pill-icon svg {
      width: 14px;
      height: 14px;
    }
    .pill-value {
      font-size: 12px;
      font-weight: 500;
      color: #1A1F36;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
    .pill:hover .pill-value {
      color: #1D4ED8;
    }
    .pill-cta {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 600;
      color: #6B7194;
      white-space: nowrap;
      transition: color 0.12s ease;
      letter-spacing: 0.01em;
    }
    .pill:hover .pill-cta {
      color: #3B82F6;
    }
    @keyframes jt-fadein {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const pill = document.createElement("div");
  pill.className = "pill";
  pill.innerHTML = `
    <span class="pill-icon">${TIE_SVG}</span>
    <span class="pill-value"></span>
    <span class="pill-cta">Use this &rarr;</span>
  `;

  const valueSpan = pill.querySelector(".pill-value") as HTMLSpanElement;
  valueSpan.textContent = value;

  shadow.appendChild(style);
  shadow.appendChild(pill);

  positionPill(pill, input);

  pill.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fillFromSuggestion(input, value);
    hideSuggestion();
  });

  resetDismissTimer();
}

export function hideSuggestion(): void {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  const host = document.getElementById(SHADOW_HOST_ID);
  if (host) host.remove();
  currentInput = null;
}

export function getProfile(): AutofillData | null {
  return cachedProfile;
}

function positionPill(
  pill: HTMLElement,
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): void {
  const rect = input.getBoundingClientRect();
  const pillHeight = 36;
  const gap = 4;

  let top = rect.bottom + gap;
  let left = rect.left;

  if (rect.bottom + pillHeight + gap > window.innerHeight) {
    top = rect.top - pillHeight - gap;
  }

  if (left + 280 > window.innerWidth) {
    left = Math.max(8, window.innerWidth - 290);
  }

  left = Math.max(8, left);

  pill.style.position = "fixed";
  pill.style.top = `${top}px`;
  pill.style.left = `${left}px`;
}

function fillFromSuggestion(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  window.dispatchEvent(new CustomEvent("jt-autofill-filling", { detail: true }));
  if (input instanceof HTMLSelectElement) {
    const lower = value.toLowerCase().trim();
    for (const opt of input.options) {
      if (opt.value.toLowerCase() === lower || opt.text.toLowerCase() === lower) {
        input.value = opt.value;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        break;
      }
    }
  } else if (
    input instanceof HTMLInputElement ||
    input instanceof HTMLTextAreaElement
  ) {
    setNativeValue(input, value);
  }
  highlightElement(input);
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("jt-autofill-filling", { detail: false }));
  }, 500);
}

function resetDismissTimer(): void {
  if (dismissTimer) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    hideSuggestion();
  }, DISMISS_TIMEOUT);
}
