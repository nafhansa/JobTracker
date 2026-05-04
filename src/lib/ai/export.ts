import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType, TabStopPosition } from "docx";
import { GenerationType, GENERATION_TYPE_LABELS } from "./types";
import jsPDF from "jspdf";

function getContentTitle(type: GenerationType, targetCompany?: string, targetRole?: string): string {
  const label = GENERATION_TYPE_LABELS[type];
  const parts = [label];
  if (targetCompany) parts.push(`to ${targetCompany}`);
  if (targetRole) parts.push(`- ${targetRole}`);
  return parts.join(" ");
}

function parseContentLines(content: string): string[] {
  return content.split("\n");
}

export async function generateDocx(params: {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  targetName?: string;
}): Promise<Buffer> {
  const { content, type, targetCompany, targetRole } = params;
  const lines = parseContentLines(content);
  const isCoverLetter = type === "cover_letter";

  const children: Paragraph[] = [];

  if (isCoverLetter) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: getContentTitle(type, targetCompany, targetRole), bold: true, size: 28, font: "Times New Roman" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  } else {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: getContentTitle(type, targetCompany, targetRole), bold: true, size: 24, font: "Calibri" })],
        spacing: { after: 300 },
      })
    );
  }

  const font = isCoverLetter ? "Times New Roman" : "Calibri";
  const defaultSize = isCoverLetter ? 24 : 22;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      children.push(new Paragraph({ children: [], spacing: { after: 120 } }));
      continue;
    }

    const isSubjectLine = trimmed.toLowerCase().startsWith("subject:") || trimmed.toLowerCase().startsWith("re:");
    const isHeader = /^(dear|to whom|to the hiring|hiring team|dear sir|dear madam)/i.test(trimmed) && trimmed.endsWith(":");
    const isClosing = /^(sincerely|best regards|kind regards|regards|warmly|cheers|yours truly|respectfully)/i.test(trimmed) && trimmed.length < 50;
    const isBullet = /^[•\-]\s/.test(trimmed);

    if (isSubjectLine) {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, bold: true, size: defaultSize, font })],
        spacing: { before: 200, after: 200 },
      }));
    } else if (isHeader) {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, size: defaultSize, font })],
        spacing: { before: 200, after: 100 },
      }));
    } else if (isClosing) {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, size: defaultSize, font })],
        spacing: { before: 200, after: 100 },
      }));
    } else if (isBullet) {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, size: defaultSize, font })],
        spacing: { after: 80 },
        bullet: { level: 0 },
      }));
    } else {
      children.push(new Paragraph({
        children: [new TextRun({ text: trimmed, size: defaultSize, font })],
        spacing: { after: 80 },
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: isCoverLetter
            ? { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            : { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generatePdf(params: {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  targetName?: string;
}): Promise<Buffer> {
  const { content, type, targetCompany, targetRole } = params;
  const lines = parseContentLines(content);
  const isCoverLetter = type === "cover_letter";
  const font = isCoverLetter ? "times" : "helvetica";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = isCoverLetter ? 72 : 56;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = isCoverLetter ? 18 : 16;
  const fontSize = isCoverLetter ? 12 : 11;

  let y = margin;

  const title = getContentTitle(type, targetCompany, targetRole);
  doc.setFont(font, "bold");
  doc.setFontSize(isCoverLetter ? 14 : 13);
  doc.text(title, margin, y);
  y += isCoverLetter ? 30 : 24;

  doc.setFont(font, "normal");
  doc.setFontSize(fontSize);

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      y += lineHeight * 0.6;
      continue;
    }

    const isSubjectLine = trimmed.toLowerCase().startsWith("subject:") || trimmed.toLowerCase().startsWith("re:");

    if (isSubjectLine) {
      doc.setFont(font, "bold");
    }

    const wrappedLines = doc.splitTextToSize(trimmed, maxWidth);

    for (const wrappedLine of wrappedLines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrappedLine, margin, y);
      y += lineHeight;
    }

    if (isSubjectLine) {
      doc.setFont(font, "normal");
    }
  }

  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}

export function getExportFilename(type: GenerationType, format: "docx" | "pdf", targetCompany?: string): string {
  const typeSlug = type.replace(/_/g, "-");
  const companySlug = targetCompany ? `_${targetCompany.toLowerCase().replace(/[^a-z0-9]/g, "-")}` : "";
  const date = new Date().toISOString().split("T")[0];
  return `${typeSlug}${companySlug}_${date}.${format}`;
}