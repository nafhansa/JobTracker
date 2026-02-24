"use client";

import { useMemo, useState } from "react";
import { JobApplication } from "@/types";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language/context";
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "daily" | "weekly" | "monthly";

interface StatsSectionProps {
  jobs: JobApplication[];
}

export default function StatsSection({ jobs }: StatsSectionProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  const stats = useMemo(() => {
    if (jobs.length === 0) {
      return {
        totalJobs: 0,
        interviewCount: 0,
        interviewRate: 0,
        chartData: [],
        hasGrowth: false,
        timeRangeLabel: "",
      };
    }

    const totalJobs = jobs.length;
    const interviewCount = jobs.filter((j) => j.status.interviewEmail).length;
    const interviewRate = totalJobs > 0 ? (interviewCount / totalJobs) * 100 : 0;

    let chartData: Array<{ date: string; count: number }> = [];
    let timeRangeLabel = "";
    const today = new Date();

    if (timeRange === "daily") {
      // Last 30 days
      timeRangeLabel = "Last 30 days";
      const jobsByDate: Record<string, number> = {};
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        return date;
      });

      last30Days.forEach((date) => {
        const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        jobsByDate[key] = 0;
      });

      jobs.forEach((job) => {
        const jobDate = new Date(job.createdAt);
        const key = jobDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (jobsByDate.hasOwnProperty(key)) {
          jobsByDate[key]++;
        }
      });

      chartData = last30Days.map((date) => {
        const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return {
          date: key,
          count: jobsByDate[key] || 0,
        };
      });
    } else if (timeRange === "weekly") {
      // Last 12 weeks (3 months)
      timeRangeLabel = "Last 12 weeks";
      const jobsByWeek: Record<string, number> = {};
      const weeks = Array.from({ length: 12 }, (_, i) => {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        return { start: weekStart, end: weekEnd, label: `W${12 - i}` };
      });

      weeks.forEach((week) => {
        jobsByWeek[week.label] = 0;
      });

      jobs.forEach((job) => {
        const jobDate = new Date(job.createdAt);
        weeks.forEach((week) => {
          if (jobDate >= week.start && jobDate <= week.end) {
            jobsByWeek[week.label]++;
          }
        });
      });

      chartData = weeks.map((week) => ({
        date: week.label,
        count: jobsByWeek[week.label] || 0,
      }));
    } else if (timeRange === "monthly") {
      // Last 12 months
      timeRangeLabel = "Last 12 months";
      const jobsByMonth: Record<string, number> = {};
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(today);
        date.setMonth(date.getMonth() - (11 - i));
        return {
          date,
          label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        };
      });

      months.forEach((month) => {
        jobsByMonth[month.label] = 0;
      });

      jobs.forEach((job) => {
        const jobDate = new Date(job.createdAt);
        const monthLabel = jobDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (jobsByMonth.hasOwnProperty(monthLabel)) {
          jobsByMonth[monthLabel]++;
        }
      });

      chartData = months.map((month) => ({
        date: month.label,
        count: jobsByMonth[month.label] || 0,
      }));
    }

    // Calculate growth trend
    const halfIndex = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfIndex).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = chartData.slice(halfIndex).reduce((sum, d) => sum + d.count, 0);
    const hasGrowth = secondHalf > firstHalf;

    return {
      totalJobs,
      interviewCount,
      interviewRate,
      chartData,
      hasGrowth,
      timeRangeLabel,
    };
  }, [jobs, timeRange]);

  if (jobs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{t("stats.noStats")}</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          {t("stats.addJobs")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mental Booster - Interview Rate Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h2 className="text-sm font-semibold text-blue-100 uppercase tracking-wider">
                  {t("stats.interviewRate")}
                </h2>
              </div>
              <p className="text-blue-200 text-xs">
                {stats.interviewCount} {t("stats.ofApplications")} {stats.totalJobs}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stats.hasGrowth ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {stats.hasGrowth ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-bold text-white tracking-tight">
              {stats.interviewRate.toFixed(1)}%
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-blue-200">
            {stats.hasGrowth ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-green-300 font-medium">Trending up</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-300" />
                <span className="text-red-300 font-medium">Keep pushing</span>
              </>
            )}
            <span>• {stats.timeRangeLabel}</span>
          </div>
        </div>
      </div>

      {/* Applications Growth Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("stats.applicationsGrowth")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{stats.timeRangeLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{stats.totalJobs}</div>
              <div className="text-xs text-muted-foreground">{t("stats.totalApplications")}</div>
            </div>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "daily" as const, label: "Daily" },
            { value: "weekly" as const, label: "Weekly" },
            { value: "monthly" as const, label: "Monthly" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${timeRange === range.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 10 }}
                tickLine={{ stroke: "#374151" }}
              />
              <YAxis
                allowDecimals={false}
                className="text-xs text-muted-foreground"
                tick={{ fontSize: 10 }}
                tickLine={{ stroke: "#374151" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                activeDot={{ r: 4, fill: "#2563eb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t("stats.totalApplications")}</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.totalJobs}</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Interviews</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{stats.interviewCount}</div>
        </div>
      </div>
    </div>
  );
}
