"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { JobApplication } from "@/types";
import { TrendingUp, TrendingDown, Briefcase, Clock, Flame, Send, Mail, MessageSquare, UserCheck, ScrollText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { getUserStreaks } from "@/lib/supabase/streaks";
import { getJobCount } from "@/lib/supabase/jobs";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "daily" | "weekly" | "monthly";

interface DashboardSectionProps {
  jobs: JobApplication[];
  userId: string;
  plan?: string;
  onAddJob?: () => void;
  onEditJob?: (job: JobApplication) => void;
  onNavigateToApplications?: () => void;
}

export default function DashboardSection({ jobs, userId, plan, onAddJob, onEditJob, onNavigateToApplications }: DashboardSectionProps) {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [activeStatusIdx, setActiveStatusIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      // Load streaks from database
      getUserStreaks(user.uid).then((streak) => {
        setStreak(streak);
      }).catch(() => setStreak({ current: 0, best: 0 }));

      // Load job count
      getJobCount(user.uid).then(setJobCount).catch(() => setJobCount(jobs.length));
    }
  }, [user]);

  // Stats calculations
  const stats = useMemo(() => {
    if (jobs.length === 0) {
      return {
        totalJobs: 0,
        interviewCount: 0,
        interviewRate: 0,
        chartData: [],
        hasGrowth: false,
        timeRangeLabel: "",
        recentActivity: [],
      };
    }

    const totalJobs = jobs.length;
    const interviewCount = jobs.filter((j) => j.status.interviewEmail).length;
    const interviewRate = totalJobs > 0 ? (interviewCount / totalJobs) * 100 : 0;

    let chartData: Array<{ date: string; count: number }> = [];
    let timeRangeLabel = "";
    const today = new Date();

    if (timeRange === "daily") {
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

    const halfIndex = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, halfIndex).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = chartData.slice(halfIndex).reduce((sum, d) => sum + d.count, 0);
    const hasGrowth = secondHalf > firstHalf;

    const recentActivity = jobs.slice(-5).reverse();

    return {
      totalJobs,
      interviewCount,
      interviewRate,
      chartData,
      hasGrowth,
      timeRangeLabel,
      recentActivity,
    };
  }, [jobs, timeRange]);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Track Your Applications</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Start tracking your job applications to see statistics, streaks, and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROW 1: Compact & Aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Interview Rate */}
        <div className="bg-primary rounded-2xl p-4 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center gap-2 opacity-90">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
            <span className="text-[15px] font-bold text-primary-foreground uppercase tracking-widest">Interview Rate</span>
          </div>
          
          <span className="text-5xl font-bold text-primary-foreground tracking-tighter">
            {stats.interviewRate.toFixed(1)}%
          </span>

          <div className="flex items-center justify-between">
            <div className="text-[10px] text-primary-foreground/70 font-medium px-2 py-0.5 rounded-full">
              {stats.interviewCount}/{stats.totalJobs} Apps
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-foreground/10 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between h-32">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/10 rounded-md">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest">Total Jobs</span>
          </div>
          <span className="text-3xl font-bold text-foreground tracking-tighter">{stats.totalJobs}</span>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">Active applications</p>
            <div className="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-bold">
              {stats.hasGrowth ? "↑ UP" : "STEADY"}
            </div>
          </div>
        </div>

        {/* Daily Streak - Compact Aesthetic */}
        <div className="relative group bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between h-32 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
             <Flame className="w-12 h-12 text-orange-500" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-md">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <span className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest">Streak</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-foreground italic tracking-tighter">{streak.current}</span>
            <span className="text-[10px] font-bold text-orange-500">DAYS</span>
          </div>

          <div className="w-full space-y-1">
            <div className="flex justify-between text-[9px] font-medium">
              <span className="text-muted-foreground">Best: {streak.best}</span>
              <span className="text-orange-600 uppercase">On Fire</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-700"
                style={{ width: `${Math.min((streak.current / (streak.best || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Application Status Breakdown */}
      {(() => {
        const statuses = [
          { key: "applied",   label: "Applied",   icon: Send,          count: jobs.filter(j => j.status.applied).length,       hex: "#60a5fa" },
          { key: "emailed",   label: "Emailed",   icon: Mail,          count: jobs.filter(j => j.status.emailed).length,       hex: "#a78bfa" },
          { key: "response",  label: "Responded", icon: MessageSquare, count: jobs.filter(j => j.status.cvResponded).length,   hex: "#22d3ee" },
          { key: "interview", label: "Interview", icon: UserCheck,     count: jobs.filter(j => j.status.interviewEmail).length, hex: "#fbbf24" },
          { key: "offer",     label: "Offers",    icon: ScrollText,    count: jobs.filter(j => j.status.contractEmail).length, hex: "#34d399" },
          { key: "rejected",  label: "Rejected",  icon: XCircle,       count: jobs.filter(j => j.status.rejected).length,      hex: "#f87171" },
        ];

        const handleScroll = () => {
          const el = carouselRef.current;
          if (!el) return;
          const center = el.scrollLeft + el.clientWidth / 2;
          let closest = 0, minDist = Infinity;
          Array.from(el.children).forEach((card, i) => {
            const c = card as HTMLElement;
            const cardCenter = c.offsetLeft + c.offsetWidth / 2;
            const dist = Math.abs(cardCenter - center);
            if (dist < minDist) { minDist = dist; closest = i; }
          });
          setActiveStatusIdx(closest);
        };

        return (
          <>
            {/* Mobile carousel */}
            <div className="md:hidden overflow-hidden">
              <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="carousel-track flex overflow-x-auto snap-x snap-mandatory gap-3 px-6 pb-1"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {statuses.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === activeStatusIdx;
                  return (
                    <div
                      key={s.key}
                      className="flex-shrink-0 snap-center flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-muted/30 border border-border transition-all duration-300"
                      style={{
                        width: "130px",
                        transform: isActive ? "scale(1.06)" : "scale(1)",
                        background: isActive ? "var(--background)" : undefined,
                        borderColor: isActive ? s.hex : undefined,
                        boxShadow: isActive ? `0 0 0 1px ${s.hex}33` : undefined,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: s.hex }} />
                      <span className="text-3xl font-bold text-foreground tracking-tight">{s.count}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5 mt-1">
                {statuses.map((s, i) => (
                  <div
                    key={s.key}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeStatusIdx ? "18px" : "6px",
                      background: i === activeStatusIdx ? s.hex : "var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-6 md:divide-x md:divide-border">
              {statuses.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.key}
                    className="flex flex-col items-center justify-center gap-2 py-4 transition-colors hover:bg-muted/40"
                  >
                    <Icon className="w-5 h-5" style={{ color: s.hex }} />
                    <span className="text-3xl font-bold text-foreground tracking-tight">{s.count}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

{/* ROW 3: Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Applications Growth</h3>
              <p className="text-sm text-muted-foreground">{stats.timeRangeLabel}</p>
            </div>
            <div className="flex gap-1.5 bg-muted/50 p-1 rounded-xl">
              {(["daily", "weekly", "monthly"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
                    ${timeRange === range
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCountDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="var(--border)" 
                  opacity={0.5} 
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px] font-medium fill-muted-foreground"
                  tick={{ dy: 10 }}
                  minTickGap={30}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px] font-medium fill-muted-foreground"
                />
                <Tooltip
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px"
                  }}
                  itemStyle={{ color: "var(--primary)", fontWeight: "bold" }}
                  labelStyle={{ marginBottom: "4px", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCountDashboard)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToApplications}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              stats.recentActivity.map((job, index) => (
                <div
                  key={job.id}
                  className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl"
                >
<div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                      {job.jobTitle}
                    </h4>
                    <p className="text-muted-foreground text-sm truncate">
                      {job.company}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {index === 0 && "Just now"}
                      {index === 1 && "2 hours ago"}
                      {index === 2 && "1 day ago"}
                      {index === 3 && "2 days ago"}
                      {index === 4 && "3 days ago"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
