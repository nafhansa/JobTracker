"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Sparkles, Plus, Clock, FileText, Mail, MessageSquare, Instagram, Trash2, Eye } from "lucide-react";
import { GeneratedDocument, GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";
import { toast } from "sonner";

interface AIWriterHomeProps {
  onCreateNew: () => void;
  onSelectDoc: (doc: GeneratedDocument) => void;
}

function typeIcon(type: GenerationType) {
  switch (type) {
    case "cover_letter": return <FileText className="w-4 h-4" />;
    case "cold_email": return <Mail className="w-4 h-4" />;
    case "cold_dm_instagram": return <Instagram className="w-4 h-4" />;
    case "cold_wa": return <MessageSquare className="w-4 h-4" />;
    case "cold_linkedin": return <Mail className="w-4 h-4" />;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AIWriterHome({ onCreateNew, onSelectDoc }: AIWriterHomeProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch("/api/ai/generations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (docId: string) => {
    if (pendingDelete !== docId) {
      setPendingDelete(docId);
      return;
    }
    setPendingDelete(null);
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch(`/api/ai/generations?id=${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        toast.success("Deleted", { description: "Generation removed." });
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error("Delete failed", { description: "Something went wrong." });
    }
  };

  const hasDocs = documents.length > 0;

  return (
    <div className="space-y-6">
      {hasDocs && (
        <div className="flex justify-end">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : !hasDocs ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No creations yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate your first cover letter or outreach message
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Recent Creations
          </div>
          <div className="space-y-2">
            {documents.slice(0, 15).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {typeIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {GENERATION_TYPE_LABELS[doc.type]}
                    </span>
                    {doc.target_company && (
                      <span className="text-xs text-muted-foreground truncate">
                        to {doc.target_company}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(doc.created_at)}
                    {doc.target_role && ` · ${doc.target_role}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className={`p-1.5 rounded-md transition-colors ${
                      pendingDelete === doc.id
                        ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                        : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {pendingDelete === doc.id ? (
                      <span className="text-[10px] font-medium">Confirm?</span>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}