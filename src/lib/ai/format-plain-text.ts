import { GenerationType } from "./types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatPlainTextToHtml(content: string, type: GenerationType): string {
  const lines = content.split("\n");
  const htmlLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      htmlLines.push("<p><br></p>");
      continue;
    }

    const isCoverLetter = type === "cover_letter";
    const isEmail = type === "cold_email";

    if (isEmail && trimmed.toLowerCase().startsWith("subject:")) {
      htmlLines.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      continue;
    }

    if (isCoverLetter) {
      if (i === 0 && /^\w+\s+\d{1,2},?\s+\d{4}/i.test(trimmed)) {
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^(dear\s|to whom|hiring team|hiring manager|dear sir|dear madam)/i.test(trimmed) && trimmed.endsWith(":")) {
        htmlLines.push(`<p>${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^(sincerely|best regards|kind regards|regards|warmly|cheers|yours truly|respectfully|with best regards)/i.test(trimmed) && trimmed.length < 50) {
        htmlLines.push(`<p><br></p><p>${escapeHtml(trimmed)}</p>`);
        continue;
      }

      if (/^[A-Z][a-z]+\s+[A-Z]/.test(trimmed) && trimmed.length < 40 && i > 0 && lines[i - 1].trim() === "") {
        htmlLines.push(`<p><strong>${escapeHtml(trimmed)}</strong></p>`);
        continue;
      }

      const emailMatch = trimmed.match(/^[\w.-]+@[\w.-]+\.\w+$/);
      if (emailMatch) {
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }

      const phoneMatch = trimmed.match(/^(\+?\d[\d\s-]{7,}|\(\d{3}\)[\s\d-]+)$/);
      if (phoneMatch && i < 6) {
        htmlLines.push(`<p style="text-align: right">${escapeHtml(trimmed)}</p>`);
        continue;
      }
    }

    if (/^[•\-]\s/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[•\-]\s*/, "");
      htmlLines.push(`<ul><li>${escapeHtml(bulletText)}</li></ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const numberedText = trimmed.replace(/^\d+\.\s*/, "");
      htmlLines.push(`<ol><li>${escapeHtml(numberedText)}</li></ol>`);
      continue;
    }

    htmlLines.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  let html = htmlLines.join("\n");

  html = html.replace(/<\/ul>\s*<ul>/g, "\n");
  html = html.replace(/<\/ol>\s*<ol>/g, "\n");

  return html;
}