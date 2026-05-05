import { GenerationType } from "./types";

export function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<") && (trimmed.includes("<p") || trimmed.includes("<h") || trimmed.includes("<ul") || trimmed.includes("<ol") || trimmed.includes("<li") || trimmed.includes("<br"));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatPlainTextToHtml(content: string, type: GenerationType): string {
  const lines = content.split("\n");
  const htmlLines: string[] = [];

  let inUl = false;
  let inOl = false;

  function closeList() {
    if (inUl) { htmlLines.push("</ul>"); inUl = false; }
    if (inOl) { htmlLines.push("</ol>"); inOl = false; }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      closeList();
      htmlLines.push("<p><br></p>");
      continue;
    }

    const isCoverLetter = type === "cover_letter";
    const isEmail = type === "cold_email";

    if (isEmail && trimmed.toLowerCase().startsWith("subject:")) {
      closeList();
      htmlLines.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      continue;
    }

    if (isCoverLetter) {
      if (i === 0 && /^\w+\s+\d{1,2},?\s+\d{4}/i.test(trimmed)) {
        closeList();
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^(dear\s|to whom|hiring team|hiring manager|dear sir|dear madam)/i.test(trimmed) && trimmed.endsWith(":")) {
        closeList();
        htmlLines.push(`<p>${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^(sincerely|best regards|kind regards|regards|warmly|cheers|yours truly|respectfully|with best regards)/i.test(trimmed) && trimmed.length < 50) {
        closeList();
        htmlLines.push(`<p><br></p><p>${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^[A-Z][a-z]+\s+[A-Z]/.test(trimmed) && trimmed.length < 40 && i > 0 && lines[i - 1].trim() === "") {
        closeList();
        htmlLines.push(`<p><strong>${escapeHtml(trimmed)}</strong></p>`);
        continue;
      }

      const emailMatch = trimmed.match(/^[\w.-]+@[\w.-]+\.\w+$/);
      if (emailMatch) {
        closeList();
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }

      const phoneMatch = trimmed.match(/^(\+?\d[\d\s-]{7,}|\(\d{3}\)[\s\d-]+)$/);
      if (phoneMatch && i < 6) {
        closeList();
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }
    }

    if (/^[•\-]\s/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[•\-]\s*/, "");
      if (inOl) { htmlLines.push("</ol>"); inOl = false; }
      if (!inUl) { htmlLines.push("<ul>"); inUl = true; }
      htmlLines.push(`<li>${escapeHtml(bulletText)}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const numberedText = trimmed.replace(/^\d+\.\s*/, "");
      if (inUl) { htmlLines.push("</ul>"); inUl = false; }
      if (!inOl) { htmlLines.push("<ol>"); inOl = true; }
      htmlLines.push(`<li>${escapeHtml(numberedText)}</li>`);
      continue;
    }

    closeList();
    htmlLines.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  closeList();

  return htmlLines.join("\n");
}