const ATS_PATTERNS: Record<string, RegExp> = {
  greenhouse: /greenhouse\.io|boards\.greenhouse\.io|job-boards\.greenhouse\.io/i,
  lever: /jobs\.lever\.co/i,
  workday: /myworkdayjobs\.com|workday\.com/i,
  icims: /icareer5\.icims\.com|icims\.com/i,
  taleo: /taleo\.net/i,
  smartrecruiters: /careers\.smartrecruiters\.com/i,
  jobvite: /jobs\.jobvite\.com/i,
  ashby: /jobs\.ashbyhq\.com/i,
  applytojob: /applytojob\.com/i,
};

export function detectATS(url: string): string | null {
  for (const [name, pattern] of Object.entries(ATS_PATTERNS)) {
    if (pattern.test(url)) return name;
  }
  return null;
}

const JOB_FORM_KEYWORDS = [
  "apply",
  "application",
  "job application",
  "employment",
  "career",
  "position",
  "submit your application",
  "apply now",
  "job opportunity",
];

export function detectJobForm(doc: Document): boolean {
  const forms = doc.querySelectorAll("form");
  if (forms.length === 0) return false;

  const pageText = doc.body?.innerText?.toLowerCase() || "";
  const hasJobKeyword = JOB_FORM_KEYWORDS.some((kw) =>
    pageText.includes(kw)
  );

  if (hasJobKeyword) return true;

  let applicationFieldCount = 0;
  for (const form of forms) {
    const inputs = form.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input:not([type]), textarea, select'
    );
    const labels = Array.from(inputs).map((el) =>
      getAssociatedText(el as HTMLElement, form).toLowerCase()
    );

    const hasName = labels.some(
      (l) => l.includes("name") || l.includes("nama")
    );
    const hasEmail = labels.some(
      (l) => l.includes("email") || l.includes("e-mail")
    );
    const hasPhone = labels.some(
      (l) =>
        l.includes("phone") ||
        l.includes("tel") ||
        l.includes("mobile") ||
        l.includes("telepon")
    );

    if (hasName) applicationFieldCount++;
    if (hasEmail) applicationFieldCount++;
    if (hasPhone) applicationFieldCount++;

    const hasResume = form.querySelector(
      'input[type="file"][accept*="pdf"], input[type="file"][accept*="doc"], input[name*="resume"], input[name*="cv"]'
    );
    if (hasResume) applicationFieldCount += 2;

    if (applicationFieldCount >= 3) return true;
  }

  return false;
}

export function getAssociatedText(el: HTMLElement, form: HTMLElement): string {
  const parts: string[] = [];

  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) parts.push(label.textContent || "");
  }

  const parent = el.closest("label");
  if (parent) parts.push(parent.textContent || "");

  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) parts.push(ariaLabel);

  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) parts.push(labelEl.textContent || "");
  }

  const placeholder = el.getAttribute("placeholder");
  if (placeholder) parts.push(placeholder);

  const name = el.getAttribute("name");
  if (name) parts.push(name.replace(/[_-]/g, " "));

  const autocomplete = el.getAttribute("autocomplete");
  if (autocomplete) parts.push(autocomplete.replace(/[_-]/g, " "));

  const parentDiv = el.closest("[class]");
  if (parentDiv) {
    const prevSibling = parentDiv.previousElementSibling;
    if (prevSibling) parts.push(prevSibling.textContent || "");
  }

  return parts.join(" ");
}
