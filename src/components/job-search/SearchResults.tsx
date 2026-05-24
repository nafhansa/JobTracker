"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { JobSearchResult, SITE_CONFIG } from "@/lib/job-search/types";
import JobCard from "./JobCard";

interface SearchResultsProps {
  results: JobSearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  onSave: (job: JobSearchResult) => void;
  onImport: (job: JobSearchResult) => void;
  savedJobUrls: Set<string>;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-20 rounded-full bg-muted/50" />
        <div className="h-4 w-16 rounded bg-muted/50" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted/50 mb-2" />
      <div className="h-4 w-1/2 rounded bg-muted/50 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-24 rounded-full bg-muted/50" />
        <div className="h-5 w-20 rounded-full bg-muted/50" />
      </div>
      <div className="h-4 w-full rounded bg-muted/50 mb-1" />
      <div className="h-4 w-2/3 rounded bg-muted/50" />
    </div>
  );
}

export default function SearchResults({ results, isSearching, hasSearched, onSave, onImport, savedJobUrls }: SearchResultsProps) {
  const { t } = useLanguage();
  if (isSearching) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <p className="font-medium text-foreground">{t("job_search.empty.title")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("job_search.empty.subtitle")}
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">{t("job_search.no_results")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("job_search.no_results.subtitle")}
        </p>
      </div>
    );
  }

  const siteCounts = results.reduce<Record<string, number>>((acc, job) => {
    const site = job.site || "unknown";
    acc[site] = (acc[site] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center flex-wrap justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("job_search.found")} <span className="font-semibold text-foreground">{results.length}</span> {results.length !== 1 ? t("job_search.jobs") : t("job_search.job")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(siteCounts).map(([site, count]) => {
            const config = SITE_CONFIG[site as keyof typeof SITE_CONFIG];
            return (
              <span key={site} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config?.bgClass || "bg-muted text-muted-foreground"}`}>
                {config?.label || site} ({count})
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((job, i) => (
          <div key={job.id || `${job.site}-${job.title}-${job.company}-${i}`} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 75}ms`, animationFillMode: "backwards" }}>
            <JobCard
              job={job}
              onSave={onSave}
              onImport={onImport}
              isSaved={savedJobUrls.has(job.job_url || "")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}