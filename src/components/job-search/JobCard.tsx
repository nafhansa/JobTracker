"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Briefcase, ExternalLink, MapPin, Clock, DollarSign, Globe } from "lucide-react";
import { JobSearchResult, SITE_CONFIG } from "@/lib/job-search/types";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  job: JobSearchResult;
  onSave: (job: JobSearchResult) => void;
  onImport: (job: JobSearchResult) => void;
  isSaved: boolean;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
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

export default function JobCard({ job, onSave, onImport, isSaved }: JobCardProps) {
  const [importing, setImporting] = useState(false);

  const siteConfig = SITE_CONFIG[(job.site as keyof typeof SITE_CONFIG) || "indeed"];
  const salary = formatSalary(job.min_amount, job.max_amount, job.currency, job.salary_interval);
  const relativeDate = formatRelativeDate(job.date_posted);

  const handleImport = async () => {
    setImporting(true);
    try {
      await onImport(job);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
      {/* Header: Site badge + Date */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${siteConfig?.bgClass || "bg-muted text-muted-foreground"}`}>
          {siteConfig?.label || job.site}
        </span>
        {relativeDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {relativeDate}
          </span>
        )}
      </div>

      {/* Title & Company */}
      <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 mb-0.5">{job.title}</h3>
      <p className="text-sm text-muted-foreground font-medium mb-2">{job.company}</p>

      {/* Location & Type */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        {(job.location || job.city || job.state || job.country) && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {[job.city, job.state, job.country].filter(Boolean).join(", ") || job.location}
          </span>
        )}
        {job.job_type && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
          </span>
        )}
        {job.is_remote && (
          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[10px] font-medium">
            Remote
          </span>
        )}
      </div>

      {/* Salary */}
      {salary && (
        <div className="flex items-center gap-1 mb-2">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{salary}</span>
          {job.salary_interval && job.salary_interval !== "yearly" && (
            <span className="text-[10px] text-muted-foreground">/{job.salary_interval}</span>
          )}
        </div>
      )}

      {/* Description Snippet */}
      {job.description && (
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
          {job.description.replace(/[#*_`>]/g, "").replace(/\n+/g, " ").trim().slice(0, 250)}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSave(job)}
          className={`gap-1.5 text-xs h-8 rounded-lg ${
            isSaved ? "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10" : ""
          }`}
          disabled={isSaved}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {isSaved ? "Saved" : "Save"}
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleImport}
          disabled={importing}
          className="gap-1.5 text-xs h-8 rounded-lg shadow-sm shadow-primary/20"
        >
          <Briefcase className="w-3.5 h-3.5" />
          {importing ? "Importing..." : "Import to Tracker"}
        </Button>

        {job.job_url && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground"
          >
            <a href={job.job_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          </Button>
        )}

        {job.job_url_direct && job.job_url_direct !== job.job_url && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 text-xs h-8 rounded-lg text-muted-foreground"
          >
            <a href={job.job_url_direct} target="_blank" rel="noopener noreferrer">
              <Globe className="w-3.5 h-3.5" />
              Direct
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}