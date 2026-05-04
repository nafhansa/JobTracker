"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Mail, MessageSquare, Instagram, Trash2, Eye } from "lucide-react";
import { GeneratedDocument, GenerationType, GENERATION_TYPE_LABELS } from "@/lib/ai/types";

interface GenerationHistoryProps {
  userId: string;
  onSelect: (doc: GeneratedDocument) => void;
}

export default function GenerationHistory({ userId, onSelect }: GenerationHistoryProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Delete this generation?")) return;
    try {
      const token = await user?.getIdToken();
      if (!token) return;
      const res = await fetch(`/api/ai/generations?id=${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const typeIcon = (type: GenerationType) => {
    switch (type) {
      case "cover_letter": return <FileText className="w-4 h-4" />;
      case "cold_email": return <Mail className="w-4 h-4" />;
      case "cold_dm_instagram": return <Instagram className="w-4 h-4" />;
      case "cold_wa": return <MessageSquare className="w-4 h-4" />;
      case "cold_linkedin": return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No generations yet</p>
            <p className="text-sm mt-1">Your generated cover letters and outreach messages will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Generation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 text-primary">
                {typeIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {GENERATION_TYPE_LABELS[doc.type]}
                  </span>
                  {doc.target_company && (
                    <span className="text-xs text-muted-foreground">
                      to {doc.target_company}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(doc.created_at)}
                  {doc.target_name && ` · ${doc.target_name}`}
                  {doc.target_role && ` · ${doc.target_role}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {doc.content.substring(0, 100)}...
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(doc)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}