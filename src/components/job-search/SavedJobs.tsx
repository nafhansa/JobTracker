"use client";

import { useState } from "react";
import { Bookmark, Briefcase, ExternalLink, Trash2, Clock, MapPin, DollarSign } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { SavedJob, SITE_CONFIG } from "@/lib/job-search/types";
import { Button } from "@/components/ui/button";

interface SavedJobsProps {
  jobs: SavedJob[];
  onDelete: (id: string) => void;
  onImport: (job: SavedJob) => void;
  onRefresh: () => void;
}

function formatSalary(min: number | null, max: number | null, currency: string | null, _interval: string | null): string | null {
  if (min == null && max == null) return null;
  const cur = currency === "USD" ? "$" : currency === "IDR" ? "Rp" : currency ? `${currency} ` : "";
  const fmt = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    return n.toLocaleString();
  };
  if (min != null && max != null && min !== max) return `${cur}${fmt(min)} – ${cur}${fmt(max)}`;
  if (min != null) return `${cur}${fmt(min)}`;
  return `Up to ${cur}${fmt(max!)}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

export default function SavedJobs({ jobs, onDelete, onImport }: SavedJobsProps) {
  const { t } = useLanguage();
  const [importingId, setImportingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleImport = async (job: SavedJob) => {
    setImportingId(job.id);
    try {
      await onImport(job);
    } finally {
      setImportingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      return;
    }
    setPendingDelete(null);
    await onDelete(id);
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">{t("job_search.saved_empty.title")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("job_search.saved_empty.subtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Bookmark className="w-3.5 h-3.5" />
        {t("job_search.tab.saved")}
      </div>
      <div className="space-y-2">
        {jobs.map((job) => {
          const siteConfig = SITE_CONFIG[(job.site as keyof typeof SITE_CONFIG) || "indeed"];
          const salary = formatSalary(job.min_amount, job.max_amount, job.currency, job.salary_interval);
          const importing = importingId === job.id;

          return (
            <div key={job.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:bg-primary/5 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate">{job.title}</span>
                    {job.site && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${siteConfig?.bgClass || "bg-muted text-muted-foreground"}`}>
                        {siteConfig?.label || job.site}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    {(job.location || job.city) && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {[job.city, job.state, job.country].filter(Boolean).join(", ") || job.location}
                      </span>
                    )}
                    {salary && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <DollarSign className="w-2.5 h-2.5" />
                        {salary}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(job.created_at)}
                    </span>
                    {job.is_remote && (
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-1.5 py-px text-[9px] font-medium">Remote</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleImport(job)}
                    disabled={importing}
                    className="gap-1 text-[11px] h-7 rounded-lg shadow-sm shadow-primary/20"
                  >
                    <Briefcase className="w-3 h-3" />
                    {importing ? "..." : "Import"}
                  </Button>
                  {job.job_url && (
                    <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0 rounded-lg">
                      <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <span
                    onClick={() => handleDelete(job.id)}
                    className={`p-1 rounded-md cursor-pointer transition-colors ${
                      pendingDelete === job.id
                        ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                        : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    {pendingDelete === job.id ? (
                      <span className="text-[9px] font-medium">Confirm?</span>
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}