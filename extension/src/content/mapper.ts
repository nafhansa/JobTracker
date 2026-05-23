import type { AutofillData } from "@/lib/types";

interface FieldMap {
  profileKey: keyof AutofillData;
  keywords: string[];
  autocompleteValues: string[];
  inputTypes: string[];
}

const FIELD_MAPS: FieldMap[] = [
  {
    profileKey: "first_name",
    keywords: [
      "first name",
      "firstname",
      "first_name",
      "given name",
      "nama depan",
      "givenname",
    ],
    autocompleteValues: ["given-name", "fname"],
    inputTypes: ["text"],
  },
  {
    profileKey: "last_name",
    keywords: [
      "last name",
      "lastname",
      "last_name",
      "surname",
      "family name",
      "nama belakang",
      "familyname",
    ],
    autocompleteValues: ["family-name", "lname"],
    inputTypes: ["text"],
  },
  {
    profileKey: "full_name",
    keywords: [
      "full name",
      "fullname",
      "full_name",
      "your name",
      "name",
      "applicant name",
      "nama lengkap",
      "nama",
      "candidate name",
    ],
    autocompleteValues: ["name", "name-full"],
    inputTypes: ["text"],
  },
  {
    profileKey: "email",
    keywords: ["email", "e-mail", "email address", "alamat email"],
    autocompleteValues: ["email"],
    inputTypes: ["email"],
  },
  {
    profileKey: "phone",
    keywords: [
      "phone",
      "mobile",
      "telephone",
      "tel",
      "phone number",
      "mobile number",
      "cell phone",
      "nomor telepon",
      "nomor hp",
    ],
    autocompleteValues: ["tel", "tel-national", "mobile"],
    inputTypes: ["tel"],
  },
  {
    profileKey: "linkedin_url",
    keywords: ["linkedin", "linkedin profile", "linkedin url", "linkedin.com"],
    autocompleteValues: ["url", "linkedin"],
    inputTypes: ["url", "text"],
  },
  {
    profileKey: "skills",
    keywords: [
      "skills",
      "technologies",
      "tech stack",
      "keahlian",
      "technical skills",
    ],
    autocompleteValues: [],
    inputTypes: ["text"],
  },
  {
    profileKey: "summary",
    keywords: [
      "summary",
      "about",
      "cover letter",
      "tell us about",
      "about yourself",
      "about you",
      "bio",
      "profile summary",
      "ringkasan",
      "tentang diri",
    ],
    autocompleteValues: [],
    inputTypes: ["text", "textarea"],
  },
  {
    profileKey: "latest_company",
    keywords: [
      "company",
      "employer",
      "organization",
      "current company",
      "perusahaan",
    ],
    autocompleteValues: ["organization", "company"],
    inputTypes: ["text"],
  },
  {
    profileKey: "latest_role",
    keywords: [
      "role",
      "title",
      "position",
      "job title",
      "current role",
      "current title",
      "posisi",
      "jabatan",
    ],
    autocompleteValues: ["organization-title"],
    inputTypes: ["text"],
  },
  {
    profileKey: "latest_education_institution",
    keywords: [
      "university",
      "college",
      "school",
      "institution",
      "universitas",
      "sekolah",
    ],
    autocompleteValues: [],
    inputTypes: ["text"],
  },
  {
    profileKey: "latest_education_degree",
    keywords: ["degree", "gelar"],
    autocompleteValues: [],
    inputTypes: ["text"],
  },
  {
    profileKey: "latest_education_field",
    keywords: [
      "field of study",
      "major",
      "area of study",
      "jurusan",
      "program studi",
    ],
    autocompleteValues: [],
    inputTypes: ["text"],
  },
];

export function mapSingleField(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  data: AutofillData
): { profileKey: keyof AutofillData; confidence: number } | null {
  if (
    input.type === "hidden" ||
    input.type === "submit" ||
    input.type === "button" ||
    input.type === "file" ||
    input.type === "password" ||
    input.type === "checkbox" ||
    input.type === "radio" ||
    input.disabled
  ) {
    return null;
  }

  const form = input.closest("form") || document.body;
  const inputText = getFullInputText(input, form);
  let bestMatch: { key: keyof AutofillData; confidence: number } | null = null;

  for (const fieldMap of FIELD_MAPS) {
    const value = (data[fieldMap.profileKey] as string) || "";
    if (!value) continue;

    const autocompleteAttr = input.getAttribute("autocomplete") || "";
    const autocompleteMatch = fieldMap.autocompleteValues.some(
      (v) => autocompleteAttr === v
    );

    if (autocompleteMatch) {
      bestMatch = { key: fieldMap.profileKey, confidence: 1.0 };
      break;
    }

    const keywordScore = textMatchesKeywords(inputText, fieldMap.keywords);
    if (keywordScore > 0 && (!bestMatch || keywordScore > bestMatch.confidence)) {
      bestMatch = { key: fieldMap.profileKey, confidence: keywordScore };
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.6) {
    return bestMatch;
  }

  return null;
}

export interface MappedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  profileKey: keyof AutofillData;
  confidence: number;
}

function textMatchesKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase().trim();
  for (const kw of keywords) {
    if (lower === kw) return 1.0;
  }
  for (const kw of keywords) {
    if (lower.includes(kw)) return 0.8;
  }
  for (const kw of keywords) {
    const words = kw.split(" ");
    if (words.every((w) => lower.includes(w))) return 0.6;
  }
  return 0;
}

export function mapFields(
  form: HTMLElement,
  data: AutofillData
): MappedField[] {
  const inputs = form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  const mapped: MappedField[] = [];
  const usedKeys = new Set<keyof AutofillData>();

  for (const input of inputs) {
    if (
      input.type === "hidden" ||
      input.type === "submit" ||
      input.type === "button" ||
      input.type === "file" ||
      input.type === "password" ||
      input.type === "checkbox" ||
      input.type === "radio" ||
      input.disabled
    ) {
      continue;
    }

    const inputText = getFullInputText(input, form);
    let bestMatch: { key: keyof AutofillData; confidence: number } | null =
      null;

    for (const fieldMap of FIELD_MAPS) {
      if (usedKeys.has(fieldMap.profileKey) && fieldMap.profileKey !== "full_name") continue;

      const value = (data[fieldMap.profileKey] as string) || "";
      if (!value) continue;

      const autocompleteAttr = input.getAttribute("autocomplete") || "";
      const autocompleteMatch = fieldMap.autocompleteValues.some(
        (v) => autocompleteAttr === v
      );

      if (autocompleteMatch) {
        bestMatch = { key: fieldMap.profileKey, confidence: 1.0 };
        break;
      }

      const keywordScore = textMatchesKeywords(inputText, fieldMap.keywords);
      if (keywordScore > 0 && (!bestMatch || keywordScore > bestMatch.confidence)) {
        bestMatch = { key: fieldMap.profileKey, confidence: keywordScore };
      }
    }

    if (bestMatch && bestMatch.confidence >= 0.6) {
      mapped.push({
        element: input,
        profileKey: bestMatch.key,
        confidence: bestMatch.confidence,
      });

      if (bestMatch.key === "full_name") {
        // Don't mark full_name as used — first_name/last_name can still match
      } else {
        usedKeys.add(bestMatch.key);
      }
    }
  }

  return mapped;
}

function getFullInputText(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  form: HTMLElement
): string {
  const parts: string[] = [];

  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) parts.push(label.textContent || "");
  }

  const parent = input.closest("label");
  if (parent) parts.push(parent.textContent || "");

  const ariaLabel = input.getAttribute("aria-label");
  if (ariaLabel) parts.push(ariaLabel);

  const labelledBy = input.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) parts.push(labelEl.textContent || "");
  }

  const placeholder = input.getAttribute("placeholder");
  if (placeholder) parts.push(placeholder);

  const name = input.getAttribute("name");
  if (name) parts.push(name.replace(/[_-]/g, " "));

  const autocomplete = input.getAttribute("autocomplete");
  if (autocomplete) parts.push(autocomplete.replace(/[_-]/g, " "));

  const container = input.closest(
    '[class*="field"], [class*="group"], [class*="input"], [class*="form"]'
  );
  if (container) {
    const label = container.querySelector("label, .label, [class*='label']");
    if (label && !label.contains(input)) parts.push(label.textContent || "");
  }

  return parts.join(" ");
}
