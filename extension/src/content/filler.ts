import type { AutofillData } from "@/lib/types";
import type { MappedField } from "./mapper";

const HIGHLIGHT_COLOR = "#3B82F6";
const HIGHLIGHT_DURATION = 2000;

export function fillFields(
  mappedFields: MappedField[],
  data: AutofillData
): { filledCount: number; fields: string[] } {
  let filledCount = 0;
  const filledFields: string[] = [];

  for (const { element, profileKey } of mappedFields) {
    const value = (data[profileKey] as string) || "";
    if (!value) continue;

    if (element instanceof HTMLSelectElement) {
      const filled = fillSelect(element, value);
      if (filled) {
        filledCount++;
        filledFields.push(profileKey);
      }
    } else if (element instanceof HTMLTextAreaElement) {
      setNativeValue(element, value);
      filledCount++;
      filledFields.push(profileKey);
    } else if (element instanceof HTMLInputElement) {
      if (element.type === "email" && !value.includes("@")) continue;
      setNativeValue(element, value);
      filledCount++;
      filledFields.push(profileKey);
    }

    highlightElement(element);
  }

  return { filledCount, fields: filledFields };
}

export function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype,
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function fillSelect(
  select: HTMLSelectElement,
  value: string
): boolean {
  const lowerValue = value.toLowerCase().trim();

  for (const option of select.options) {
    if (option.value.toLowerCase() === lowerValue || option.text.toLowerCase() === lowerValue) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }

  for (const option of select.options) {
    if (
      option.text.toLowerCase().includes(lowerValue) ||
      lowerValue.includes(option.text.toLowerCase())
    ) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
  }

  return false;
}

export function highlightElement(
  element: HTMLElement
): void {
  const originalOutline = element.style.outline;
  const originalOutlineOffset = element.style.outlineOffset;
  const originalTransition = element.style.transition;

  element.style.transition = "outline 0.3s ease, outline-offset 0.3s ease";
  element.style.outline = `2px solid ${HIGHLIGHT_COLOR}`;
  element.style.outlineOffset = "2px";

  setTimeout(() => {
    element.style.outline = originalOutline;
    element.style.outlineOffset = originalOutlineOffset;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
  }, HIGHLIGHT_DURATION);
}

export function insertFillBadge(filledCount: number): void {
  const existing = document.getElementById("jt-autofill-badge");
  if (existing) existing.remove();

  const badge = document.createElement("div");
  badge.id = "jt-autofill-badge";
  badge.textContent = `✓ ${filledCount} field${filledCount !== 1 ? "s" : ""} filled by JobTracker`;
  Object.assign(badge.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#16a34a",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "system-ui, sans-serif",
    fontWeight: "600",
    zIndex: "2147483647",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "opacity 0.5s ease",
    opacity: "1",
  });
  document.body.appendChild(badge);

  setTimeout(() => {
    badge.style.opacity = "0";
    setTimeout(() => badge.remove(), 500);
  }, 3000);
}
