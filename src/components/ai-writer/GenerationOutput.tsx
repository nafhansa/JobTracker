"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Copy, Check, X, FileText, Mail, MessageSquare, Instagram, Sparkles, Download, Loader2, Pencil, CheckSquare, Save } from "lucide-react";
import { GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";
import { formatPlainTextToHtml, isHtmlContent } from "@/lib/ai/format-plain-text";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";

interface GenerationOutputProps {
  content: string;
  type: GenerationType;
  targetCompany?: string;
  targetRole?: string;
  documentId?: string;
  onDismiss: () => void;
}

export default function GenerationOutput({ content, type, targetCompany, targetRole, documentId, onDismiss }: GenerationOutputProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editable, setEditable] = useState(false);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef<{ getHTML: () => string }>(null);

  const initialHtml = isHtmlContent(content) ? content : formatPlainTextToHtml(content, type);
  const [editorContent, setEditorContent] = useState(initialHtml);

const handleSave = async () => {
    console.log("[handleSave] documentId:", documentId);
    if (!documentId) {
      toast.error("Save failed", { description: "No document ID found. Cannot save." });
      return;
    }
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      if (!token) { toast.error("Save failed", { description: "Not authenticated." }); setSaving(false); return; }
      const htmlContent = editorRef.current?.getHTML() || editorContent;

      const res = await fetch("/api/ai/generations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: documentId, content: htmlContent }),
      });

      console.log("[handleSave] response status:", res.status, "ok:", res.ok);

      if (!res.ok) {
        let errorMsg = `Save failed (${res.status})`;
        try {
          const data = await res.json();
          errorMsg = data.error || data.details || data.message || JSON.stringify(data);
        } catch {
          try { errorMsg = await res.text(); } catch { errorMsg = `HTTP ${res.status}`; }
        }
        console.error("[handleSave] Error from server:", errorMsg);
        throw new Error(errorMsg);
      }

      setSaved(true);
      toast.success("Saved", { description: "Your edits have been saved." });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Save failed", { description: err instanceof Error ? err.message : "Could not save your edits." });
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditing = () => {
    setEditable(true);
    setSaved(false);
  };

  const handleDoneEditing = async () => {
    if (documentId && !saved) {
      await handleSave();
    }
    setEditable(false);
  };

  const handleContentChange = (html: string) => {
    setEditorContent(html);
    if (editable) setSaved(false);
  };

  const typeIcon = () => {
    switch (type) {
      case "cover_letter": return <FileText className="w-5 h-5" />;
      case "cold_email": return <Mail className="w-5 h-5" />;
      case "cold_dm_instagram": return <Instagram className="w-5 h-5" />;
      case "cold_wa": return <MessageSquare className="w-5 h-5" />;
      case "cold_linkedin": return <Mail className="w-5 h-5" />;
    }
  };

  const handleCopy = async () => {
    const textToCopy = editorRef.current?.getHTML() || editorContent;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = textToCopy;
    const plainText = tempDiv.textContent || tempDiv.innerText || content;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = plainText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const htmlContent = editorRef.current?.getHTML() || editorContent;
      const res = await fetch("/api/ai/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: htmlContent,
          type,
          format: "docx",
          targetCompany: targetCompany || undefined,
          targetRole: targetRole || undefined,
          isHtml: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Docx export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const htmlContent = editorRef.current?.getHTML() || editorContent;
      const res = await fetch("/api/ai/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: htmlContent,
          type,
          format: "pdf",
          targetCompany: targetCompany || undefined,
          targetRole: targetRole || undefined,
          isHtml: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-2 duration-300 rounded-xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {typeIcon()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {GENERATION_TYPE_LABELS[type]}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Generated by AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={editable ? handleDoneEditing : handleStartEditing}
              className="flex items-center gap-1.5 h-8"
            >
              {editable ? (
                <>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                  <span className="text-xs">{saving ? "Saving..." : "Done"}</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="text-xs">Edit</span>
                </>
              )}
            </Button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <RichTextEditor
          ref={editorRef}
          initialContent={initialHtml}
          editable={editable}
          onContentChange={handleContentChange}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1.5 h-8"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDocx}
            disabled={exportingDocx}
            className="flex items-center gap-1.5 h-8"
          >
            {exportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">.docx</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 h-8"
          >
            {exportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="text-xs">.pdf</span>
          </Button>
        </div>
      </div>
    </div>
  );
}