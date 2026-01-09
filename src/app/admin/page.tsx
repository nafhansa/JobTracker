// /home/nafhan/Documents/projek/job/src/app/admin/page.tsx
"use client"; // ✅ Wajib ada karena pakai useEffect

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { AnalyticsStats } from "@/types";
import { Users, LogIn, Activity, TrendingUp, Clock, Filter, Globe, Eye } from "lucide-react";

interface AppUser {
  uid: string;
  email: string | null;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const admins = ["nafhan1723@gmail.com", "nafhan.sh@gmail.com"];

  const fetchAnalytics = useCallback(async (visitorTimeFilter?: string, visitorPageFilter?: string) => {
    try {
      const params = new URLSearchParams();
      const timeFilterToUse = visitorTimeFilter || timeFilter;
      const pageFilterToUse = visitorPageFilter || pageFilter;
      
      if (timeFilterToUse !== "all") params.append("timeFilter", timeFilterToUse);
      if (pageFilterToUse !== "all") params.append("pageFilter", pageFilterToUse);
      
      const url = `/api/analytics/stats${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
        setLastUpdated(new Date());
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [timeFilter, pageFilter]);

  useEffect(() => {
    if (!loading) {
      // Ganti email ini dengan email admin kamu
      if (user && admins.includes(user.email || "")) {
        setIsAdmin(true);

        const fetchUsers = async () => {
          try {
            const response = await fetch("/api/users"); 
            const data = await response.json();
            
            if (response.ok) {
              setUsers(data);
            } else {
              console.error("Failed to fetch users");
            }
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        };
        
        fetchUsers();
        fetchAnalytics();

        // Auto-refresh analytics every 30 seconds
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
      } else {
        // Kalau bukan admin, tendang ke dashboard biasa
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, fetchAnalytics]);

  // Re-fetch when time filter changes (for both logs)
  useEffect(() => {
    if (isAdmin && !loading) {
      fetchAnalytics();
    }
  }, [timeFilter, isAdmin, loading, fetchAnalytics]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a0201]">
        <p className="text-[#FFF0C4]">Loading or unauthorized...</p>
      </div>
    );
  }
  
  // Sisa kode tampilan ke bawah SAMA PERSIS, tidak perlu diubah.
  return (
    <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans">
      <header className="bg-[#3E0703]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg">
        <h1 className="font-serif font-bold text-xl tracking-widest text-[#FFF0C4]">
          Admin Dashboard
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold tracking-widest text-[#FFF0C4] hover:text-[#8C1007]"
        >
          Back to Dashboard
        </button>
      </header>
      <main className="p-6 space-y-6">
        {/* Analytics Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-[#FFF0C4]">Analytics Dashboard</h2>
            <div className="flex items-center gap-2 text-sm text-[#FFF0C4]/60">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Visitors */}
              <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-[#8C1007]/20 rounded-lg">
                    <Users className="w-5 h-5 text-[#8C1007]" />
                  </div>
                </div>
                <h3 className="text-sm text-[#FFF0C4]/60 mb-1">Total Visitors</h3>
                <p className="text-3xl font-bold text-[#FFF0C4]">{analytics.totalVisitors}</p>
                <p className="text-xs text-[#FFF0C4]/40 mt-2">
                  {analytics.recentVisits.length > 0 && `+${analytics.recentVisits[0]?.count || 0} today`}
                </p>
              </div>

              {/* Login Attempts */}
              <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-[#8C1007]/20 rounded-lg">
                    <LogIn className="w-5 h-5 text-[#8C1007]" />
                  </div>
                </div>
                <h3 className="text-sm text-[#FFF0C4]/60 mb-1">Login Attempts</h3>
                <p className="text-3xl font-bold text-[#FFF0C4]">{analytics.loginAttempts}</p>
                <p className="text-xs text-[#FFF0C4]/40 mt-2">
                  {analytics.recentLogins.length > 0 && `+${analytics.recentLogins[0]?.count || 0} today`}
                </p>
              </div>

              {/* Active Users */}
              <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-[#8C1007]/20 rounded-lg">
                    <Activity className="w-5 h-5 text-[#8C1007]" />
                  </div>
                </div>
                <h3 className="text-sm text-[#FFF0C4]/60 mb-1">Active Users</h3>
                <p className="text-3xl font-bold text-[#FFF0C4]">{analytics.activeUsers}</p>
                <p className="text-xs text-[#FFF0C4]/40 mt-2">Last 5 minutes</p>
              </div>

              {/* Dashboard Visits */}
              <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-[#8C1007]/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#8C1007]" />
                  </div>
                </div>
                <h3 className="text-sm text-[#FFF0C4]/60 mb-1">Dashboard Visits</h3>
                <p className="text-3xl font-bold text-[#FFF0C4]">{analytics.dashboardVisits}</p>
                <p className="text-xs text-[#FFF0C4]/40 mt-2">
                  {analytics.conversionRate > 0 && `${analytics.conversionRate}% conversion`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl p-6 text-center">
              <p className="text-[#FFF0C4]/60">Loading analytics...</p>
            </div>
          )}

          {/* Conversion Rate Card */}
          {analytics && (
            <div className="bg-[#3E0703] border border-[#8C1007]/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#FFF0C4] mb-4">Conversion Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-[#FFF0C4]/60 mb-1">Login → Dashboard</p>
                  <p className="text-2xl font-bold text-[#FFF0C4]">
                    {analytics.conversionRate}%
                  </p>
                  <p className="text-xs text-[#FFF0C4]/40 mt-1">
                    {analytics.dashboardVisits} of {analytics.loginAttempts} logins
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#FFF0C4]/60 mb-1">Visitor → Login</p>
                  <p className="text-2xl font-bold text-[#FFF0C4]">
                    {analytics.totalVisitors > 0 
                      ? Math.round((analytics.loginAttempts / analytics.totalVisitors) * 100 * 100) / 100
                      : 0}%
                  </p>
                  <p className="text-xs text-[#FFF0C4]/40 mt-1">
                    {analytics.loginAttempts} of {analytics.totalVisitors} visitors
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#FFF0C4]/60 mb-1">Visitor → Dashboard</p>
                  <p className="text-2xl font-bold text-[#FFF0C4]">
                    {analytics.totalVisitors > 0 
                      ? Math.round((analytics.dashboardVisits / analytics.totalVisitors) * 100 * 100) / 100
                      : 0}%
                  </p>
                  <p className="text-xs text-[#FFF0C4]/40 mt-1">
                    {analytics.dashboardVisits} of {analytics.totalVisitors} visitors
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visitor Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#8C1007]" />
              <h2 className="text-2xl font-serif font-bold text-[#FFF0C4]">Visitor Logs</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FFF0C4]/60" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-lg px-3 py-1.5 text-sm text-[#FFF0C4] focus:outline-none focus:border-[#8C1007]"
                >
                  <option value="all">All Time</option>
                  <option value="5m">Last 5 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                  <option value="30m">Last 30 minutes</option>
                  <option value="1h">Last hour</option>
                  <option value="24h">Last 24 hours</option>
                </select>
              </div>
              <select
                value={pageFilter}
                onChange={(e) => {
                  setPageFilter(e.target.value);
                  // Immediately fetch with new page filter
                  fetchAnalytics(timeFilter, e.target.value);
                }}
                className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-lg px-3 py-1.5 text-sm text-[#FFF0C4] focus:outline-none focus:border-[#8C1007]"
              >
                <option value="all">All Pages</option>
                <option value="home">Home</option>
                <option value="login">Login</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
          </div>

          <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-[#FFF0C4]/10">
                <thead className="bg-[#3E0703]/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Time Ago</th>
                  </tr>
                </thead>
                <tbody className="bg-[#2a0401] divide-y divide-[#FFF0C4]/5">
                  {analytics?.visitorLogs && analytics.visitorLogs.length > 0 ? (
                    analytics.visitorLogs.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const timeAgo = Math.floor((Date.now() - logDate.getTime()) / 1000);
                      const formatTimeAgo = () => {
                        if (timeAgo < 60) return `${timeAgo}s ago`;
                        if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
                        if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
                        return `${Math.floor(timeAgo / 86400)}d ago`;
                      };
                      
                      return (
                        <tr key={log.id} className="hover:bg-[#3E0703]/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4] font-mono">
                            {logDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#8C1007]/20 text-[#8C1007] text-xs font-medium">
                              <Globe className="w-3 h-3" />
                              {log.page}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/60">
                            {formatTimeAgo()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#FFF0C4]/40">
                        No visitor logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Login Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#8C1007]" />
              <h2 className="text-2xl font-serif font-bold text-[#FFF0C4]">Login Logs</h2>
            </div>
            <div className="text-sm text-[#FFF0C4]/60">
              Showing {analytics?.loginLogs?.length || 0} login attempts
            </div>
          </div>

          <div className="bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-[#FFF0C4]/10">
                <thead className="bg-[#3E0703]/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Time Ago</th>
                  </tr>
                </thead>
                <tbody className="bg-[#2a0401] divide-y divide-[#FFF0C4]/5">
                  {analytics?.loginLogs && analytics.loginLogs.length > 0 ? (
                    analytics.loginLogs.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const timeAgo = Math.floor((Date.now() - logDate.getTime()) / 1000);
                      const formatTimeAgo = () => {
                        if (timeAgo < 60) return `${timeAgo}s ago`;
                        if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
                        if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
                        return `${Math.floor(timeAgo / 86400)}d ago`;
                      };
                      
                      return (
                        <tr key={log.id} className="hover:bg-[#3E0703]/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4] font-mono">
                            {logDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80">
                            {log.userEmail || (
                              <span className="text-[#FFF0C4]/40 italic">Anonymous</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/60 font-mono text-xs">
                            {log.userId ? (
                              <span className="text-[#8C1007]">{log.userId.slice(0, 8)}...</span>
                            ) : (
                              <span className="text-[#FFF0C4]/40">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/60">
                            {formatTimeAgo()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#FFF0C4]/40">
                        No login logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#FFF0C4] mb-4">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl">
            <thead>
              <tr className="border-b border-[#FFF0C4]/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0C4]/10">
              {users.map((appUser) => (
                <tr key={appUser.uid}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]">{appUser.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80">{new Date(appUser.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80 capitalize">{appUser.subscription?.plan || "Free"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appUser.subscription?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {appUser.subscription?.status || "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}