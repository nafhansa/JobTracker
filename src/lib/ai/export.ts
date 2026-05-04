import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType, TabStopPosition, UnderlineType } from "docx";
import { GenerationType, GENERATION_TYPE_LABELS } from "./types";

interface HtmlRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

type ParagraphAlignment = "left" | "center" | "right" | "start" | "end" | "both";

interface HtmlParagraph {
  runs: HtmlRun[];
  alignment?: ParagraphAlignment;
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
  bullet?: boolean;
  ordered?: boolean;
}

function stripStructuralTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<(?!\/?(?:strong|b|em|i|u)\b)[^>]+>/gi, "")
    .replace(/<\/?(?:strong|b|em|i|u)>/gi, (tag) => tag.toLowerCase());
}

function parseHtmlToParagraphs(html: string): HtmlParagraph[] {
  const paragraphs: HtmlParagraph[] = [];
  const normalized = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const blockRegex = /<(p|h[1-6]|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(normalized)) !== null) {
    const tag = match[1].toLowerCase();
    const rawContent = match[2];
    const fullMatch = match[0];

    let alignment: ParagraphAlignment | undefined;
    const alignMatch = fullMatch.match(/style="[^"]*text-align:\s*(left|center|right)[^"]*"/i);
    if (alignMatch) {
      alignment = alignMatch[1].toLowerCase() as ParagraphAlignment;
    }

    let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
    let bullet = false;

    if (tag === "h2") heading = HeadingLevel.HEADING_2;
    else if (tag === "h3" || tag.startsWith("h")) heading = HeadingLevel.HEADING_3;
    else if (tag === "li") bullet = true;

    const stripped = rawContent.replace(/<br\s*\/?>/gi, "").trim();

    if (tag === "p" && stripped === "") {
      paragraphs.push({ runs: [{ text: "" }], alignment });
      continue;
    }

    const content = stripStructuralTags(rawContent).trim();
    const runs = parseInlineFormatting(content);

    if (runs.length === 0 || (runs.length === 1 && runs[0].text.trim() === "")) {
      paragraphs.push({ runs: [{ text: "" }], alignment });
      continue;
    }

    paragraphs.push({ runs, alignment, heading, bullet });
  }

  if (paragraphs.length === 0) {
    const lines = html.replace(/<[^>]+>/g, "").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        paragraphs.push({ runs: [{ text: "" }] });
      } else {
        const runs = parseInlineFormatting(stripStructuralTags(trimmed));
        paragraphs.push({ runs: runs.length > 0 ? runs : [{ text: "" }] });
      }
    }
  }

  return paragraphs;
}

function parseInlineFormatting(html: string): HtmlRun[] {
  const runs: HtmlRun[] = [];
  const regex = /<(strong|b|em|i|u|\/(?:strong|b|em|i|u))[^>]*>|([^<]+)/gi;
  let match: RegExpExecArray | null;
  let bold = false;
  let italic = false;
  let underline = false;

  while ((match = regex.exec(html)) !== null) {
    if (match[2] !== undefined && match[2] !== "") {
      const decoded = match[2]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
      if (decoded) {
        runs.push({ text: decoded, bold, italic, underline });
      }
    } else if (match[1]) {
      const tag = match[1].toLowerCase();
      if (tag === "strong" || tag === "b") bold = true;
      else if (tag === "/strong" || tag === "/b") bold = false;
      else if (tag === "em" || tag === "i") italic = true;
      else if (tag === "/em" || tag === "/i") italic = false;
      else if (tag === "u") underline = true;
      else if (tag === "/u") underline = false;
    }
  }

  return runs;
}

function parsePlainTextToParagraphs(content: string, type: GenerationType): HtmlParagraph[] {
  const lines = content.split("\n");
  const paragraphs: HtmlParagraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      paragraphs.push({ runs: [{ text: "" }], alignment: AlignmentType.LEFT });
      continue;
    }

    const isSubjectLine = trimmed.toLowerCase().startsWith("subject:") || trimmed.toLowerCase().startsWith("re:");
    const isBullet = /^[•\-]\s/.test(trimmed);

    if (isSubjectLine) {
      paragraphs.push({
        runs: [{ text: trimmed, bold: true }],
        alignment: AlignmentType.LEFT,
      });
    } else if (isBullet) {
      const text = trimmed.replace(/^[•\-]\s*/, "");
      paragraphs.push({
        runs: [{ text }],
        bullet: true,
      });
    } else {
      paragraphs.push({
        runs: [{ text: trimmed }],
        alignment: "left",
      });
    }
  }

  return paragraphs;
}

export async function generateDocx(params: {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  targetName?: string;
  isHtml?: boolean;
}): Promise<Buffer> {
  const { content, type, targetCompany, targetRole, isHtml } = params;
  const isCoverLetter = type === "cover_letter";
  const font = isCoverLetter ? "Times New Roman" : "Calibri";
  const defaultSize = isCoverLetter ? 24 : 22;

  const parsedParagraphs = isHtml
    ? parseHtmlToParagraphs(content)
    : parsePlainTextToParagraphs(content, type);

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: GENERATION_TYPE_LABELS[type] + (targetCompany ? ` to ${targetCompany}` : "") + (targetRole ? ` - ${targetRole}` : ""),
          bold: true,
          size: isCoverLetter ? 28 : 24,
          font,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: isCoverLetter ? 400 : 300 },
    })
  );

  for (const para of parsedParagraphs) {
    const textRuns = para.runs
      .filter((r) => r.text !== "")
      .map((r) =>
        new TextRun({
          text: r.text,
          bold: r.bold || !!para.heading,
          italics: r.italic,
          underline: r.underline ? { type: UnderlineType.SINGLE } : undefined,
          size: para.heading ? (para.heading === HeadingLevel.HEADING_2 ? 28 : 26) : defaultSize,
          font,
        })
      );

    if (textRuns.length === 0) {
      textRuns.push(new TextRun({ text: "", size: defaultSize, font }));
    }

    children.push(
      new Paragraph({
        children: textRuns,
        alignment: para.alignment || AlignmentType.LEFT,
        heading: para.heading,
        spacing: { after: isCoverLetter ? 160 : 100 },
        ...(para.bullet ? { bullet: { level: 0 } } : {}),
      })
    );
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

import jsPDF from "jspdf";

export async function generatePdf(params: {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  targetName?: string;
  isHtml?: boolean;
}): Promise<Buffer> {
  const { content, type, targetCompany, targetRole, isHtml } = params;
  const isCoverLetter = type === "cover_letter";
  const parsedParagraphs = isHtml
    ? parseHtmlToParagraphs(content)
    : parsePlainTextToParagraphs(content, type);

  const font = isCoverLetter ? "times" : "helvetica";
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = isCoverLetter ? 60 : 50;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = isCoverLetter ? 16 : 14;
  const defaultSize = isCoverLetter ? 12 : 11;

  let y = margin;

  const title = GENERATION_TYPE_LABELS[type] + (targetCompany ? ` to ${targetCompany}` : "") + (targetRole ? ` - ${targetRole}` : "");
  doc.setFont(font, "bold");
  doc.setFontSize(isCoverLetter ? 14 : 13);
  doc.setTextColor(26, 26, 26);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  for (const line of titleLines) {
    if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += lineHeight;
  }
  y += lineHeight * 0.5;

  const paraSpacing = isCoverLetter ? 8 : 4;

  for (const para of parsedParagraphs) {
    const paraSize = para.heading
      ? para.heading === HeadingLevel.HEADING_2 ? defaultSize + 2 : defaultSize + 1
      : defaultSize;

    doc.setFontSize(paraSize);

    if (para.runs.length === 1 && para.runs[0].text.trim() === "") {
      y += lineHeight;
      continue;
    }

    const align: "left" | "center" | "right" = para.alignment === "center" ? "center" : para.alignment === "right" ? "right" : "left";
    const textIndent = para.bullet ? 15 : 0;
    const effectiveMaxWidth = maxWidth - textIndent;

    const hasRichFormatting = para.runs.some((r) => r.bold || r.italic || r.underline) || !!para.heading;

    if (hasRichFormatting) {
      const lines = wrapRichText(doc, para.runs, effectiveMaxWidth, font, paraSize);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
        if (para.bullet) {
          doc.setFont(font, "normal");
          doc.setFontSize(defaultSize);
          doc.text("\u2022", margin + 5, y);
        }
        drawRichLine(doc, line, font, paraSize, margin + textIndent, y, align, pageWidth, effectiveMaxWidth);
        y += lineHeight;
      }
    } else {
      const plainText = para.runs.map((r) => r.text).join("");
      const wrappedLines = doc.splitTextToSize(plainText, effectiveMaxWidth);
      const xPos = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - margin : margin + textIndent;

      doc.setFont(font, "normal");
      doc.setFontSize(paraSize);

      if (para.bullet && wrappedLines.length > 0) {
        doc.setFont(font, "normal");
        doc.setFontSize(defaultSize);
        if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text("\u2022", margin + 5, y);
      }

      for (const line of wrappedLines) {
        if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.setFontSize(paraSize);
        doc.text(line, xPos, y, { align });
        y += lineHeight;
      }
    }
    y += paraSpacing;
  }

  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}

interface RichLineSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

function wrapRichText(
  doc: jsPDF,
  runs: HtmlRun[],
  maxWidth: number,
  font: string,
  fontSize: number
): RichLineSegment[][] {
  const lines: RichLineSegment[][] = [];
  let currentLine: RichLineSegment[] = [];
  let currentLineWidth = 0;

  for (const run of runs) {
    const jsFontStyle = run.bold && run.italic ? "bolditalic" : run.bold ? "bold" : run.italic ? "italic" : "normal";
    doc.setFont(font, jsFontStyle);
    doc.setFontSize(fontSize);

    const words = run.text.split(/(\s+)/);
    for (const word of words) {
      if (word === "") continue;
      const wordWidth = doc.getTextWidth(word);

      if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
        const lastSeg = currentLine[currentLine.length - 1];
        if (lastSeg.text.endsWith(" ")) {
          lastSeg.text = lastSeg.text.replace(/\s+$/, "");
          currentLineWidth -= doc.getTextWidth(" ");
        }
        lines.push(currentLine);
        currentLine = [];
        currentLineWidth = 0;

        if (/^\s+$/.test(word)) continue;
      }

      if (currentLine.length > 0) {
        const lastSeg = currentLine[currentLine.length - 1];
        if (lastSeg.bold === run.bold && lastSeg.italic === run.italic && lastSeg.underline === run.underline) {
          lastSeg.text += word;
        } else {
          currentLine.push({ text: word, bold: !!run.bold, italic: !!run.italic, underline: !!run.underline });
        }
      } else {
        currentLine.push({ text: word, bold: !!run.bold, italic: !!run.italic, underline: !!run.underline });
      }
      currentLineWidth += wordWidth;
    }
  }

  if (currentLine.length > 0) {
    const lastSeg = currentLine[currentLine.length - 1];
    lastSeg.text = lastSeg.text.replace(/\s+$/, "");
    lines.push(currentLine);
  }

  return lines;
}

function drawRichLine(
  doc: jsPDF,
  segments: RichLineSegment[],
  font: string,
  fontSize: number,
  startX: number,
  y: number,
  align: "left" | "center" | "right",
  pageWidth: number,
  _maxWidth: number
) {
  let totalWidth = 0;
  for (const seg of segments) {
    const style = seg.bold && seg.italic ? "bolditalic" : seg.bold ? "bold" : seg.italic ? "italic" : "normal";
    doc.setFont(font, style);
    doc.setFontSize(fontSize);
    totalWidth += doc.getTextWidth(seg.text);
  }

  let x: number;
  if (align === "center") x = (pageWidth - 2 * (startX - (pageWidth / 2 - totalWidth / 2))) / 2 - totalWidth / 2 + startX;
  else if (align === "right") x = startX + (_maxWidth - totalWidth);
  else x = startX;

  // simpler: calculate x based on align
  if (align === "center") {
    x = startX + (_maxWidth - totalWidth) / 2;
  } else if (align === "right") {
    x = startX + _maxWidth - totalWidth;
  } else {
    x = startX;
  }

  const margin = startX;
  for (const seg of segments) {
    const style = seg.bold && seg.italic ? "bolditalic" : seg.bold ? "bold" : seg.italic ? "italic" : "normal";
    doc.setFont(font, style);
    doc.setFontSize(fontSize);
    doc.setTextColor(26, 26, 26);
    const textToDraw = seg.text.replace(/^\s+/, "");
    if (textToDraw) {
      doc.text(textToDraw, x, y);
      const drawnWidth = doc.getTextWidth(textToDraw);
      if (seg.underline) {
        doc.line(x, y + 1.5, x + drawnWidth, y + 1.5);
      }
      x += doc.getTextWidth(seg.text);
    } else {
      x += doc.getTextWidth(seg.text);
    }
  }
  doc.setTextColor(26, 26, 26);
}

export function getExportFilename(type: GenerationType, format: "docx" | "pdf", targetCompany?: string): string {
  const typeSlug = type.replace(/_/g, "-");
  const companySlug = targetCompany ? `_${targetCompany.toLowerCase().replace(/[^a-z0-9]/g, "-")}` : "";
  const date = new Date().toISOString().split("T")[0];
  return `${typeSlug}${companySlug}_${date}.${format}`;
}