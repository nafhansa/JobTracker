"use client";

import { useState } from "react";
import { Search, MapPin, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchParams, JobSite, SITE_CONFIG, JOB_TYPE_OPTIONS, HOURS_OLD_OPTIONS, COUNTRY_OPTIONS, DEFAULT_SEARCH_PARAMS } from "@/lib/job-search/types";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  initialParams: SearchParams;
}

const ALL_SITES: JobSite[] = ["linkedin", "indeed", "glassdoor", "google", "zip_recruiter"];

export default function SearchForm({ onSearch, isSearching, initialParams }: SearchFormProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialParams.search_term || "");
  const [location, setLocation] = useState(initialParams.location || "");
  const [selectedSites, setSelectedSites] = useState<JobSite[]>(
    initialParams.site_name.length > 0 ? initialParams.site_name : ["indeed", "linkedin", "google"]
  );
  const [jobType, setJobType] = useState(initialParams.job_type || "");
  const [isRemote, setIsRemote] = useState(initialParams.is_remote || false);
  const [hoursOld, setHoursOld] = useState<number>(initialParams.hours_old || 0);
  const [resultsWanted, setResultsWanted] = useState(initialParams.results_wanted || 15);
  const [countryIndeed, setCountryIndeed] = useState(initialParams.country_indeed || "Indonesia");
  const [showFilters, setShowFilters] = useState(true);

  const toggleSite = (site: JobSite) => {
    setSelectedSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || selectedSites.length === 0) return;
    onSearch({
      ...DEFAULT_SEARCH_PARAMS,
      search_term: searchTerm.trim(),
      location: location.trim() || undefined,
      site_name: selectedSites,
      job_type: (jobType as SearchParams["job_type"]) || undefined,
      is_remote: isRemote,
      results_wanted: resultsWanted,
      hours_old: hoursOld > 0 ? hoursOld : undefined,
      country_indeed: countryIndeed || undefined,
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Main search row */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{t("job_search.title")}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showFilters ? t("job_search.filters") : "Filters"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("job_search.placeholder.keyword")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl"
              />
            </div>
            <div className="sm:w-56 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("job_search.placeholder.location")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Source chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("job_search.sources")}</span>
            <div className="flex flex-wrap gap-2">
              {ALL_SITES.map((site) => {
                const config = SITE_CONFIG[site];
                const isActive = selectedSites.includes(site);
                return (
                  <button
                    key={site}
                    type="button"
                    onClick={() => toggleSite(site)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                      isActive
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible filters */}
          <div className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("job_search.job_type")}</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("job_search.posted_within")}</label>
                  <select
                    value={hoursOld}
                    onChange={(e) => setHoursOld(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {HOURS_OLD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("job_search.country")}</label>
                  <select
                    value={countryIndeed}
                    onChange={(e) => setCountryIndeed(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{t("job_search.results_wanted")} ({resultsWanted})</label>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={resultsWanted}
                    onChange={(e) => setResultsWanted(Number(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${isRemote ? "bg-primary" : "bg-muted"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRemote ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{t("job_search.remote")}</span>
              </label>
            </div>
          </div>

          {/* Search button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-xl shadow-md shadow-primary/20"
            disabled={isSearching || !searchTerm.trim() || selectedSites.length === 0}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {t("job_search.button.search")} {resultsWanted}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}