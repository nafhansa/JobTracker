"use client";

import { useState, useMemo } from "react";
import { JobApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Briefcase, Building, Check } from "lucide-react";

type StatusFilter = "all" | "applied" | "emailed" | "responded" | "interview" | "contract" | "rejected";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "emailed", label: "Emailed" },
  { id: "responded", label: "Responded" },
  { id: "interview", label: "Interview" },
  { id: "contract", label: "Contract" },
  { id: "rejected", label: "Rejected" },
];

function getJobStatus(job: JobApplication): StatusFilter {
  if (job.status.rejected) return "rejected";
  if (job.status.contractEmail) return "contract";
  if (job.status.interviewEmail) return "interview";
  if (job.status.cvResponded) return "responded";
  if (job.status.emailed) return "emailed";
  return "applied";
}

const STATUS_COLORS: Record<string, string> = {
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  contract: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  interview: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  responded: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  applied: "bg-muted text-muted-foreground",
  emailed: "bg-muted text-muted-foreground",
};

interface JobPickerProps {
  jobs: JobApplication[];
  selectedJobId: string;
  onSelectJob: (job: JobApplication) => void;
  onAddJob: () => void;
}

export default function JobPicker({ jobs, selectedJobId, onSelectJob, onAddJob }: JobPickerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    let result = jobs;

    if (filter !== "all") {
      result = result.filter((j) => getJobStatus(j) === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          (j.jobTitle || "").toLowerCase().includes(q) ||
          (j.company || "").toLowerCase().includes(q) ||
          (j.recruiterEmail || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [jobs, filter, search]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-background"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddJob}
          className="flex items-center gap-1.5 shrink-0 h-9"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Job
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {jobs.length === 0
              ? "No jobs tracked yet. Tap Add Job to start."
              : "No matching jobs found."}
          </div>
        ) : (
          filtered.map((job) => {
            const isSelected = selectedJobId === job.id;
            const status = getJobStatus(job);

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob(job)}
                className={`w-full flex items-center gap-3 p-2.5 text-left transition-all ${
                  isSelected
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {job.jobTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {job.company}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                      STATUS_COLORS[status] || STATUS_COLORS.applied
                    }`}
                  >
                    {STATUS_FILTERS.find((f) => f.id === status)?.label || status}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}