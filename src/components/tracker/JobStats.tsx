"use client";

import { useMemo } from "react";
import { JobApplication, JobStatus } from "@/types";
import { BarChart3, TrendingUp, Briefcase, Send, MessageSquare, UserCheck, ScrollText, XCircle } from "lucide-react";

interface JobStatsProps {
  jobs: JobApplication[];
}

export default function JobStats({ jobs }: JobStatsProps) {
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    if (totalJobs === 0) return null;

    // Calculate Job Source percentages
    const jobSourceCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      const source = job.applicationUrl || "Unknown";
      jobSourceCounts[source] = (jobSourceCounts[source] || 0) + 1;
    });
    const jobSourcePercentages = Object.entries(jobSourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // Calculate Job Type percentages
    const jobTypeCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      const type = job.jobType || "Unknown";
      jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
    });
    const jobTypePercentages = Object.entries(jobTypeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate Stage counts
    const getJobStage = (status: JobStatus) => {
      if (status.rejected) return "rejected";
      if (status.contractEmail) return "offer";
      if (status.interviewEmail) return "interview";
      if (status.cvResponded) return "response";
      if (status.emailed) return "emailed";
      return "applied";
    };

    const stageCounts: { [key: string]: number } = {
      applied: 0,
      emailed: 0,
      response: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    jobs.forEach(job => {
      const stage = getJobStage(job.status);
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    const maxStageCount = Math.max(...Object.values(stageCounts));

    return {
      jobSourcePercentages,
      jobTypePercentages,
      stageCounts,
      maxStageCount,
      totalJobs,
    };
  }, [jobs]);

  if (!stats) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No statistics available yet</p>
          <p className="text-muted-foreground text-xs mt-1">Add some jobs to see your stats</p>
        </div>
      </div>
    );
  }

  const stageLabels = {
    applied: { label: "Applied", icon: Send, color: "bg-blue-500" },
    emailed: { label: "Emailed", icon: MessageSquare, color: "bg-purple-500" },
    response: { label: "Responded", icon: MessageSquare, color: "bg-indigo-500" },
    interview: { label: "Interview", icon: UserCheck, color: "bg-yellow-500" },
    offer: { label: "Offers", icon: ScrollText, color: "bg-green-500" },
    rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500" },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Statistics</h3>
      </div>

      {/* Top Job Source */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Top Job Sources</h4>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {stats.jobSourcePercentages.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.source}</span>
                <span className="text-xs font-bold text-primary">{item.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Type Percentages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Job Types</h4>
          <Briefcase className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {stats.jobTypePercentages.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.type}</span>
                <span className="text-xs font-bold text-primary">{item.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Application Stages</h4>
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {Object.entries(stageLabels).map(([key, { label, icon: Icon, color }]) => {
            const count = stats.stageCounts[key] || 0;
            const percentage = stats.maxStageCount > 0 
              ? Math.round((count / stats.maxStageCount) * 100) 
              : 0;
            
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`${color} rounded-full h-2.5 transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
