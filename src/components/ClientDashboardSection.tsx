"use client";

import { useState, useMemo, useEffect } from "react";
import { DollarSign, Users, TrendingUp, Briefcase, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/lib/language/context";
import { subscribeToFreelanceJobs } from "@/lib/supabase/freelance-jobs";
import { FreelanceJob } from "@/types";

interface ClientDashboardSectionProps {
  userId?: string;
  onNavigateToClients?: () => void;
  onAddClientClick?: () => void;
}

export default function ClientDashboardSection({ userId, onNavigateToClients, onAddClientClick }: ClientDashboardSectionProps) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);

  useEffect(() => {
    if (userId) {
      const channel = subscribeToFreelanceJobs(userId, (data) => {
        setJobs(data);
      });
      return () => {
        channel.unsubscribe();
      };
    }
  }, [userId]);

  const stats = useMemo(() => {
    const totalIncome = jobs.reduce((sum, job) => sum + (job.actualPrice || job.potentialPrice || 0), 0);
    const uniqueClients = new Set(jobs.map((job) => job.clientName)).size;
    const avgRate = jobs.length > 0 ? totalIncome / jobs.length : 0;

    const monthlyIncome: Record<string, number> = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
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

    return {
      totalIncome,
      uniqueClients,
      avgRate,
      chartData,
      ongoingCount,
      completedCount,
      recentProjects: jobs.slice(0, 4),
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

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">{t("client.empty.title")}</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          {t("client.empty.desc")}
        </p>
        <Button 
          onClick={onAddClientClick}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("client.add")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="flex items-center gap-2 opacity-90">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground uppercase tracking-widest">{t("client.totalIncome")}</span>
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
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("client.totalClients")}</span>
          </div>
          <span className="text-4xl font-bold text-foreground tracking-tighter">{stats.uniqueClients}</span>
          <p className="text-xs text-muted-foreground">{t("client.uniqueClients")}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("client.avgRate")}</span>
          </div>
          <span className="text-3xl font-bold text-foreground tracking-tighter">{formatCurrency(stats.avgRate)}</span>
          <p className="text-xs text-muted-foreground">{t("client.avgRateDesc")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t("client.monthlyIncome")}</h3>
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
                  cursor={{ fill: "var(--primary)", fillOpacity: 0.1 }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`Rp ${(value as number).toFixed(1)}M`, t("client.income")]}
                />
                <Bar
                  dataKey="income"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{t("client.recentProjects")}</h3>
            </div>
            {onNavigateToClients && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToClients}
                className="text-primary hover:text-primary/80"
              >
                {t("client.viewAll")}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {stats.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">
                    {project.clientName}
                  </h4>
                  <p className="text-muted-foreground text-xs truncate">
                    {project.serviceType}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    project.status === "ongoing" 
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}>
                    {project.status === "ongoing" ? t("client.ongoing") : t("client.completed")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}