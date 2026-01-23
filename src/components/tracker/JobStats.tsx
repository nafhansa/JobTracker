"use client";

import { useMemo, useState, useRef } from "react";
import { JobApplication } from "@/types";
import { BarChart3, Briefcase, Send, MessageSquare, UserCheck, ScrollText, XCircle, PieChart, X, Building } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

interface JobStatsProps {
  jobs: JobApplication[];
}

// Function to normalize job source from URL
const normalizeSource = (url: string | undefined): string => {
  if (!url) return "Unknown";
  
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes("hiringcafe")) return "HiringCafe";
  if (urlLower.includes("paired.com") || urlLower.includes("paired")) return "Paired";
  if (urlLower.includes("flexjobs")) return "FlexJobs";
  
  // Try to extract domain name
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    // Return domain without extension for better readability
    return hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1);
  } catch {
    return url; // Return original if URL parsing fails
  }
};

// Pie chart colors
const pieColors = [
  "#3b82f6", // blue-500
  "#8b5cf6", // purple-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
];

export default function JobStats({ jobs }: JobStatsProps) {
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const pieChartRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    if (totalJobs === 0) return null;

    // Calculate Job Source percentages with normalization
    const jobSourceCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      const source = normalizeSource(job.applicationUrl);
      jobSourceCounts[source] = (jobSourceCounts[source] || 0) + 1;
    });
    const jobSourcePercentages = Object.entries(jobSourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 for pie chart

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

    // Calculate Location percentages
    const locationCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      const loc = job.location || "Unknown";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const locationPercentages = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate Stage counts
    // Applied includes ALL jobs (all jobs that have been added are considered applied)
    const stageCounts: { [key: string]: number } = {
      applied: totalJobs, // All jobs are applied
      emailed: 0,
      response: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    jobs.forEach(job => {
      // Count each stage independently (not mutually exclusive)
      if (job.status.emailed) stageCounts.emailed++;
      if (job.status.cvResponded) stageCounts.response++;
      if (job.status.interviewEmail) stageCounts.interview++;
      if (job.status.contractEmail) stageCounts.offer++;
      if (job.status.rejected) stageCounts.rejected++;
    });

    const maxStageCount = Math.max(...Object.values(stageCounts));

    return {
      jobSourcePercentages,
      jobTypePercentages,
      locationPercentages,
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
          <p className="text-muted-foreground text-sm">{t("stats.noStats")}</p>
          <p className="text-muted-foreground text-xs mt-1">{t("stats.addJobs")}</p>
        </div>
      </div>
    );
  }

  const stageLabels = {
    applied: { label: t("filter.applied"), icon: Send, color: "bg-blue-500" },
    emailed: { label: t("filter.emailed"), icon: MessageSquare, color: "bg-purple-500" },
    response: { label: t("filter.response"), icon: MessageSquare, color: "bg-indigo-500" },
    interview: { label: t("filter.interview"), icon: UserCheck, color: "bg-yellow-500" },
    offer: { label: t("filter.offer"), icon: ScrollText, color: "bg-green-500" },
    rejected: { label: t("filter.rejected"), icon: XCircle, color: "bg-red-500" },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{t("stats.title")}</h3>
      </div>

      {/* Top Job Source - Pie Chart */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">{t("stats.topSources")}</h4>
          <PieChart className="w-4 h-4 text-muted-foreground" />
        </div>
        {stats.jobSourcePercentages.length > 0 ? (
          <>
            {/* Hover Tooltip - fixed positioning to be above everything */}
            {hoveredIndex !== null && !selectedIndex && (
              <div 
                className="fixed z-[9999] bg-popover border border-border rounded-lg shadow-xl p-3 w-[180px] pointer-events-none animate-in fade-in-0 zoom-in-95"
                style={{
                  top: `${tooltipPosition.top - 10}px`,
                  left: `${tooltipPosition.left}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pieColors[hoveredIndex % pieColors.length] }}
                  />
                  <span className="font-semibold text-sm text-foreground truncate">
                    {stats.jobSourcePercentages[hoveredIndex].source}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground">{t("stats.percentage")}</span>
                    <span className="font-bold text-primary">
                      {stats.jobSourcePercentages[hoveredIndex].percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground">{t("stats.applications")}</span>
                    <span className="font-bold text-foreground">
                      {stats.jobSourcePercentages[hoveredIndex].count}
                    </span>
                  </div>
                  <div className="pt-1.5 mt-1.5 border-t border-border">
                    <span className="text-muted-foreground text-[10px]">{t("stats.clickDetails")}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center gap-4 relative">
              {/* Pie Chart SVG with Interactive Slices */}
              <div ref={pieChartRef} className="relative w-48 h-48 flex-shrink-0 p-2">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full transform -rotate-90 cursor-pointer overflow-visible"
                style={{ overflow: 'visible' }}
              >
                {(() => {
                  let currentAngle = 0;
                  return stats.jobSourcePercentages.map((item, idx) => {
                    const angle = (item.percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;

                    // Calculate path for pie slice
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const startX = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                    const startY = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                    const endX = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
                    const endY = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

                    const pathData = [
                      `M 50 50`,
                      `L ${startX} ${startY}`,
                      `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      `Z`,
                    ].join(" ");

                    const isHovered = hoveredIndex === idx;
                    const isSelected = selectedIndex === idx;

                    return (
                      <g key={idx}>
                        <path
                          d={pathData}
                          fill={pieColors[idx % pieColors.length]}
                          className={`transition-all duration-200 cursor-pointer ${
                            isHovered || isSelected 
                              ? "opacity-90 drop-shadow-lg" 
                              : "opacity-100"
                          }`}
                          style={{
                            transform: isHovered || isSelected 
                              ? `scale(1.05)` 
                              : "scale(1)",
                            transformOrigin: "50px 50px",
                          }}
                          onMouseEnter={() => {
                            setHoveredIndex(idx);
                            if (pieChartRef.current) {
                              const rect = pieChartRef.current.getBoundingClientRect();
                              setTooltipPosition({
                                top: rect.top,
                                left: rect.left + rect.width / 2,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                        />
                      </g>
                    );
                  });
                })()}
              </svg>
              
              {/* Center Label with Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-1.5 px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-foreground tracking-tight">
                    {stats.totalJobs}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Jobs
                  </div>
                  {hoveredIndex !== null && (
                    <div className="mt-1.5 pt-1.5 border-t border-border/50 w-full flex flex-col items-center gap-0.5">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {stats.jobSourcePercentages[hoveredIndex]?.source}
                      </div>
                      <div className="text-base font-bold text-primary">
                        {stats.jobSourcePercentages[hoveredIndex]?.percentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Selected Detail Box */}
              {selectedIndex !== null && (
              <div className="w-full bg-popover border border-border rounded-xl shadow-lg p-4 animate-in fade-in-0 zoom-in-95 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: pieColors[selectedIndex % pieColors.length] }}
                    />
                    <h5 className="font-bold text-base text-foreground">
                      {stats.jobSourcePercentages[selectedIndex].source}
                    </h5>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(null);
                    }}
                    className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Close details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium">Percentage</div>
                    <div className="text-xl font-bold text-primary">
                      {stats.jobSourcePercentages[selectedIndex].percentage}%
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium">Applications</div>
                    <div className="text-xl font-bold text-foreground">
                      {stats.jobSourcePercentages[selectedIndex].count}
                    </div>
                  </div>
                </div>
              </div>
              )}
              
              {/* Legend */}
              <div className="w-full space-y-2">
              {stats.jobSourcePercentages.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between gap-2 p-2 rounded-md transition-colors cursor-pointer ${
                    hoveredIndex === idx || selectedIndex === idx
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                    />
                    <span className="text-xs font-medium text-foreground truncate">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{item.percentage}%</span>
                    <span className="text-xs text-muted-foreground">({item.count})</span>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No job sources available
          </div>
        )}
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

      {/* Location Percentages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Locations</h4>
          <Building className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {stats.locationPercentages.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{item.location}</span>
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
