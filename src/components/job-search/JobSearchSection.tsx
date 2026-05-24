"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { toast } from "sonner";
import { Search as SearchIcon, Bookmark } from "lucide-react";
import { trackJobSearchPerformed, trackJobSearchBookmarked } from "@/lib/posthog/events";
import { JobSearchResult, SearchParams, SavedJob, DEFAULT_SEARCH_PARAMS } from "@/lib/job-search/types";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import SavedJobs from "./SavedJobs";

type Tab = "search" | "saved";

export default function JobSearchSection({ userId: _userId }: { userId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({ ...DEFAULT_SEARCH_PARAMS });
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/job-search/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.data || []);
        const jobUrls = new Set<string>();
        (data.data || []).forEach((j: SavedJob) => {
          if (j.job_url) jobUrls.add(j.job_url);
        });
        setSavedJobIds(jobUrls);
      }
    } catch (err) {
      console.error("Failed to fetch saved jobs:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleSearch = useCallback(async (params: SearchParams) => {
    if (!user) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchParams(params);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/job-search/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Search failed", { description: data.details || "Please try again" });
        setSearchResults([]);
        return;
      }
      setSearchResults(data.results || []);
      if (data.count > 0) {
        toast.success(`Found ${data.count} job${data.count !== 1 ? "s" : ""}`);
      } else {
        toast.info("No jobs found. Try different keywords or filters.");
      }
      if (data.site_warnings?.length) {
        data.site_warnings.forEach((w: { site: string; message: string }) => {
          toast.warning(w.message, { duration: 5000 });
        });
      }
      if (data.site_errors?.length) {
        data.site_errors.forEach((e: { site: string; message: string }) => {
          toast.error(`${e.site}: ${e.message}`, { duration: 4000 });
        });
      }
      trackJobSearchPerformed(params.site_name, data.count || 0);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed", { description: "Could not reach the job search service" });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  const handleSave = useCallback(async (job: JobSearchResult) => {
    if (!user) return;
    const jobUrl = job.job_url || "";
    if (savedJobIds.has(jobUrl)) {
      toast.info("Already saved");
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/job-search/save", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company || null,
          location: job.location || null,
          city: job.city || null,
          state: job.state || null,
          country: job.country || null,
          job_url: job.job_url || null,
          job_url_direct: job.job_url_direct || null,
          description: job.description || null,
          job_type: job.job_type || null,
          is_remote: job.is_remote,
          min_amount: job.min_amount,
          max_amount: job.max_amount,
          currency: job.currency || "USD",
          salary_source: job.salary_source || null,
          salary_interval: job.salary_interval || null,
          date_posted: job.date_posted || null,
          site: job.site || null,
          company_url: job.company_url || null,
          company_industry: job.company_industry || null,
          company_logo: job.company_logo || null,
          source_data: job,
        }),
      });
      if (res.ok) {
        toast.success("Job saved");
        setSavedJobIds((prev) => new Set([...prev, jobUrl]));
        trackJobSearchBookmarked(job.site || "unknown", job.title);
        fetchSavedJobs();
      } else {
        const data = await res.json();
        if (res.status === 409) {
          toast.info("Already saved");
          setSavedJobIds((prev) => new Set([...prev, jobUrl]));
        } else {
          toast.error(data.error || "Failed to save");
        }
      }
    } catch {
      toast.error("Failed to save job");
    }
  }, [user, savedJobIds, fetchSavedJobs]);

  const handleDeleteSaved = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/job-search/save?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedJobs((prev) => prev.filter((j) => j.id !== id));
        toast.success("Removed from saved");
      } else {
        toast.error("Failed to remove");
      }
    } catch {
      toast.error("Failed to remove");
    }
  }, [user]);

  const handleImport = useCallback(async (job: JobSearchResult | SavedJob) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/job-search/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Job imported to tracker", { description: job.title });
      } else if (res.status === 403) {
        toast.error("Free plan limit reached", { description: "Upgrade to add more jobs" });
      } else {
        toast.error(data.error || "Failed to import");
      }
    } catch {
      toast.error("Failed to import job");
    }
  }, [user]);

  return (
    <div className="space-y-5">
      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "search"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SearchIcon className="w-4 h-4" />
          {t("job_search.tab.search")}
          {hasSearched && searchResults.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "search" ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {searchResults.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("saved"); fetchSavedJobs(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "saved"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          {t("job_search.tab.saved")}
          {savedJobs.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "saved" ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {savedJobs.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "search" ? (
        <div className="space-y-5">
          <SearchForm
            onSearch={handleSearch}
            isSearching={isSearching}
            initialParams={searchParams}
          />
          <SearchResults
            results={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
            onSave={handleSave}
            onImport={handleImport}
            savedJobUrls={savedJobIds}
          />
        </div>
      ) : (
        <SavedJobs
          jobs={savedJobs}
          onDelete={handleDeleteSaved}
          onImport={handleImport}
          onRefresh={fetchSavedJobs}
        />
      )}
    </div>
  );
}