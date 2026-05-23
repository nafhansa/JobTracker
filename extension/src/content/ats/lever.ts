import type { AutofillData } from "../storage";
import type { MappedField } from "../mapper";
import type { ATSAdapter } from "./index";

function detect(): boolean {
  return /jobs\.lever\.co/i.test(window.location.href);
}

function getForm(): HTMLElement | null {
  return document.querySelector(".application-form") || document.querySelector("form");
}

function mapFields(data: AutofillData): MappedField[] {
  const fields: MappedField[] = [];

  const nameInput = document.querySelector<HTMLInputElement>(
    'input[name*="name"], input[id*="name"]'
  );
  if (nameInput && data.full_name) {
    const label = nameInput.closest("[class]")?.querySelector("label, .label");
    const labelText = label?.textContent?.toLowerCase() || "";

    if (labelText.includes("first") || nameInput.name.includes("first")) {
      fields.push({ element: nameInput, profileKey: "first_name", confidence: 1.0 });
    } else if (labelText.includes("last") || nameInput.name.includes("last")) {
      fields.push({ element: nameInput, profileKey: "last_name", confidence: 1.0 });
    } else {
      fields.push({ element: nameInput, profileKey: "full_name", confidence: 1.0 });
    }
  }

  const emailInput = document.querySelector<HTMLInputElement>(
    'input[type="email"], input[name*="email"]'
  );
  if (emailInput && data.email) {
    fields.push({ element: emailInput, profileKey: "email", confidence: 1.0 });
  }

  const phoneInput = document.querySelector<HTMLInputElement>(
    'input[type="tel"], input[name*="phone"]'
  );
  if (phoneInput && data.phone) {
    fields.push({ element: phoneInput, profileKey: "phone", confidence: 1.0 });
  }

  const linkedinInput = document.querySelector<HTMLInputElement>(
    'input[name*="linkedin"], input[name*="urls"]'
  );
  if (linkedinInput && data.linkedin_url) {
    fields.push({ element: linkedinInput, profileKey: "linkedin_url", confidence: 0.9 });
  }

  return fields;
}

export const leverAdapter: ATSAdapter = {
  name: "lever",
  detect,
  getForm,
  mapFields,
};
