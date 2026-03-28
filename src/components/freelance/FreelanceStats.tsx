"use client";

import { useMemo } from "react";
import { FreelanceJob } from "@/types";
import { DollarSign, Users, TrendingUp, Briefcase, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FreelanceStatsProps {
  jobs: FreelanceJob[];
}

export default function FreelanceStats({ jobs }: FreelanceStatsProps) {
  const stats = useMemo(() => {
    const totalIncome = jobs.reduce((sum, job) => sum + (job.actualPrice || job.potentialPrice || 0), 0);
    const uniqueClients = new Set(jobs.map((job) => job.clientName)).size;
    const avgRate = jobs.length > 0 ? totalIncome / jobs.length : 0;

    const monthlyIncome: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString("en-US", { month: "short" });
      monthlyIncome[key] = 0;
    }

    jobs.forEach((job) => {
      if (job.startDate) {
        const jobDate = new Date(job.startDate);
        const key = jobDate.toLocaleDateString("en-US", { month: "short" });
        if (monthlyIncome.hasOwnProperty(key)) {
          monthlyIncome[key] += job.actualPrice || job.potentialPrice || 0;
        }
      }
    });

    const chartData = Object.entries(monthlyIncome).map(([month, income]) => ({
      month,
      income: income / 1000000,
    }));

    const ongoingCount = jobs.filter((j) => j.status === "ongoing").length;
    const completedCount = jobs.filter((j) => j.status === "completed").length;
    const cancelledCount = jobs.filter((j) => j.status === "cancelled").length;

    return {
      totalIncome,
      uniqueClients,
      avgRate,
      chartData,
      ongoingCount,
      completedCount,
      cancelledCount,
    };
  }, [jobs]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}K`;
    }
    return `Rp ${value}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex items-center gap-2 opacity-90">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground uppercase tracking-widest">Total Income</span>
          </div>
          <span className="text-4xl font-bold text-primary-foreground tracking-tighter">
            {formatCurrency(stats.totalIncome)}
          </span>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Clients</span>
          </div>
          <span className="text-4xl font-bold text-foreground tracking-tighter">{stats.uniqueClients}</span>
          <p className="text-xs text-muted-foreground">Unique clients served</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Avg Rate</span>
          </div>
          <span className="text-3xl font-bold text-foreground tracking-tighter">{formatCurrency(stats.avgRate)}</span>
          <p className="text-xs text-muted-foreground">Per project average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Monthly Income</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px] font-medium fill-muted-foreground"
                  tick={{ dy: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px] font-medium fill-muted-foreground"
                  tickFormatter={(value) => `${value}M`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`Rp ${(value as number).toFixed(1)}M`, "Income"]}
                />
                <Bar
                  dataKey="income"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Project Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ongoing</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.ongoingCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Completed</p>
                  <p className="text-xs text-muted-foreground">Successfully finished</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Cancelled</p>
                  <p className="text-xs text-muted-foreground">Cancelled projects</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelledCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}