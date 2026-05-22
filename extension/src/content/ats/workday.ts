import type { AutofillData } from "@/lib/types";
import type { MappedField } from "../mapper";
import type { ATSAdapter } from "./index";

function detect(): boolean {
  return /myworkdayjobs\.com/i.test(window.location.href);
}

function getForm(): HTMLElement | null {
  return (
    document.querySelector('[data-automation-id*="applicationForm"]') ||
    document.querySelector("form") ||
    document.querySelector('[role="form"]')
  );
}

function mapFields(data: AutofillData): MappedField[] {
  const fields: MappedField[] = [];

  const firstNameInput = document.querySelector<HTMLInputElement>(
    '[data-automation-id*="firstName"], input[aria-label*="First Name"], input[aria-label*="first name"]'
  );
  if (firstNameInput && data.first_name) {
    fields.push({ element: firstNameInput, profileKey: "first_name", confidence: 1.0 });
  }

  const lastNameInput = document.querySelector<HTMLInputElement>(
    '[data-automation-id*="lastName"], input[aria-label*="Last Name"], input[aria-label*="last name"]'
  );
  if (lastNameInput && data.last_name) {
    fields.push({ element: lastNameInput, profileKey: "last_name", confidence: 1.0 });
  }

  const emailInput = document.querySelector<HTMLInputElement>(
    '[data-automation-id*="email"], input[type="email"]'
  );
  if (emailInput && data.email) {
    fields.push({ element: emailInput, profileKey: "email", confidence: 1.0 });
  }

  const phoneInput = document.querySelector<HTMLInputElement>(
    '[data-automation-id*="phone"], input[type="tel"]'
  );
  if (phoneInput && data.phone) {
    fields.push({ element: phoneInput, profileKey: "phone", confidence: 1.0 });
  }

  const linkedinInput = document.querySelector<HTMLInputElement>(
    'input[aria-label*="LinkedIn"], input[aria-label*="linkedin"]'
  );
  if (linkedinInput && data.linkedin_url) {
    fields.push({ element: linkedinInput, profileKey: "linkedin_url", confidence: 1.0 });
  }

  return fields;
}

export const workdayAdapter: ATSAdapter = {
  name: "workday",
  detect,
  getForm,
  mapFields,
};
