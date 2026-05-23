import type { AutofillData } from "../storage";
import type { MappedField, MappedField as MF } from "../mapper";
import type { ATSAdapter } from "./index";

function detect(): boolean {
  return /greenhouse\.io/i.test(window.location.href);
}

function getForm(): HTMLElement | null {
  return document.querySelector("#application_form") || document.querySelector("form");
}

function mapFields(data: AutofillData): MappedField[] {
  const fields: MappedField[] = [];

  const firstNameInput = document.querySelector<HTMLInputElement>(
    'input[id*="first_name"], input[name*="first_name"]'
  );
  if (firstNameInput && data.first_name) {
    fields.push({ element: firstNameInput, profileKey: "first_name", confidence: 1.0 });
  }

  const lastNameInput = document.querySelector<HTMLInputElement>(
    'input[id*="last_name"], input[name*="last_name"]'
  );
  if (lastNameInput && data.last_name) {
    fields.push({ element: lastNameInput, profileKey: "last_name", confidence: 1.0 });
  }

  const emailInput = document.querySelector<HTMLInputElement>(
    'input[id*="email"], input[name*="email"], input[type="email"]'
  );
  if (emailInput && data.email) {
    fields.push({ element: emailInput, profileKey: "email", confidence: 1.0 });
  }

  const phoneInput = document.querySelector<HTMLInputElement>(
    'input[id*="phone"], input[name*="phone"], input[type="tel"]'
  );
  if (phoneInput && data.phone) {
    fields.push({ element: phoneInput, profileKey: "phone", confidence: 1.0 });
  }

  const linkedinInput = document.querySelector<HTMLInputElement>(
    'input[id*="linkedin"], input[name*="linkedin"]'
  );
  if (linkedinInput && data.linkedin_url) {
    fields.push({ element: linkedinInput, profileKey: "linkedin_url", confidence: 1.0 });
  }

  return fields;
}

export const greenhouseAdapter: ATSAdapter = {
  name: "greenhouse",
  detect,
  getForm,
  mapFields,
};
