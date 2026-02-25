// /home/nafhan/Documents/projek/job/src/app/admin/page.tsx
"use client"; // ✅ Wajib ada karena pakai useEffect

export const dynamic = 'force-dynamic'; // Prevent static generation

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { AnalyticsStats } from "@/types";
import { getOrCreateSessionId } from "@/lib/utils/analytics";
import { Users, LogIn, Activity, TrendingUp, Clock, Filter, Globe, Eye, Smartphone, Repeat, RefreshCw, Shield, MapPin, Network, MousePointer, Scroll, Timer, Crown } from "lucide-react";

// Admin emails - constant outside component
const ADMIN_EMAILS = ["nafhan1723@gmail.com", "nafhan.sh@gmail.com"];

interface AppUser {
  uid: string;
  email: string | null;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface LifetimePurchase {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  currency: string;
  purchased_at: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [lifetimePurchases, setLifetimePurchases] = useState<LifetimePurchase[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Track if initial fetch is done

  // Simple cache: store last fetch time and data
  const CACHE_DURATION = 60000; // 1 minute cache

  const fetchAnalytics = useCallback(async (visitorTimeFilter?: string, visitorPageFilter?: string, showLoading = false, forceRefresh = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    const timeFilterToUse = visitorTimeFilter ?? timeFilter;
    const pageFilterToUse = visitorPageFilter ?? pageFilter;
    const currentCacheKey = `analytics_${timeFilterToUse}_${pageFilterToUse}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && typeof window !== "undefined") {
      const cached = localStorage.getItem(currentCacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < CACHE_DURATION) {
            setAnalytics(data);
            setLastUpdated(new Date(timestamp));
            if (showLoading) setIsRefreshing(false);
            return;
          }
        } catch {
          // Cache invalid, continue to fetch
        }
      }
    }
    
    try {
      const params = new URLSearchParams();
      if (timeFilterToUse !== "all") params.append("timeFilter", timeFilterToUse);
      if (pageFilterToUse !== "all") params.append("pageFilter", pageFilterToUse);
      
      const url = `/api/analytics/stats${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
        setLastUpdated(new Date());
        setHasFetched(true);
        
        // Cache the result
        if (typeof window !== "undefined") {
          localStorage.setItem(currentCacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  }, [timeFilter, pageFilter]);

  // Initial fetch only once on mount
  useEffect(() => {
    if (!loading && !hasFetched) {
      if (user && ADMIN_EMAILS.includes(user.email || "")) {
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

        const fetchLifetimePurchases = async () => {
          try {
            const response = await fetch("/api/admin/lifetime-purchases");
            const data = await response.json();
            
            if (response.ok) {
              setLifetimePurchases(data);
            } else {
              console.error("Failed to fetch lifetime purchases");
            }
          } catch (error) {
            console.error("Error fetching lifetime purchases:", error);
          }
        };
        
        fetchUsers();
        fetchLifetimePurchases();
        fetchAnalytics(undefined, undefined, false, false);
      } else {
        // Kalau bukan admin, tendang ke dashboard biasa
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, hasFetched, fetchAnalytics]); // Include all dependencies

  // Re-fetch when time filter or page filter changes (but only if already fetched once)
  useEffect(() => {
    if (isAdmin && !loading && hasFetched) {
      fetchAnalytics(undefined, undefined, false, true); // Force refresh when filter changes
    }
  }, [timeFilter, pageFilter, isAdmin, loading, hasFetched, fetchAnalytics]); // Include all dependencies

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground">Loading or unauthorized...</p>
      </div>
    );
  }
  
  // Sisa kode tampilan ke bawah SAMA PERSIS, tidak perlu diubah.
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground">
      <header className="bg-card/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg border-b border-border">
        <h1 className="font-bold text-xl tracking-widest text-foreground">
          Admin Dashboard
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold tracking-widest text-foreground hover:text-primary transition-colors"
        >
          Back to Dashboard
        </button>
      </header>
      <main className="p-6 space-y-6">
        {/* Analytics Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Stats from 50 most recent records (quota optimized)</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Visitors */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Total Visitors</h3>
                <p className="text-3xl font-bold text-foreground">{analytics.totalVisitors}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {analytics.recentVisits.length > 0 && `+${analytics.recentVisits[0]?.count || 0} today`}
                </p>
              </div>

              {/* Login Attempts */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <LogIn className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Login Attempts</h3>
                <p className="text-3xl font-bold text-foreground">{analytics.loginAttempts}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {analytics.recentLogins.length > 0 && `+${analytics.recentLogins[0]?.count || 0} today`}
                </p>
              </div>

              {/* Active Users */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Active Users</h3>
                <p className="text-3xl font-bold text-foreground">{analytics.activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-2">Last 5 minutes</p>
              </div>

              {/* Dashboard Visits */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Dashboard Visits</h3>
                <p className="text-3xl font-bold text-foreground">{analytics.dashboardVisits}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {analytics.conversionRate > 0 && `${analytics.conversionRate}% conversion`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          )}

          {/* Conversion Rate Card */}
          {analytics && (
            <div className="bg-card border border-primary/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Conversion Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Login → Dashboard</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.conversionRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.dashboardVisits} of {analytics.loginAttempts} logins
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Visitor → Login</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.totalVisitors > 0 
                      ? Math.round((analytics.loginAttempts / analytics.totalVisitors) * 100 * 100) / 100
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.loginAttempts} of {analytics.totalVisitors} visitors
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Visitor → Dashboard</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.totalVisitors > 0 
                      ? Math.round((analytics.dashboardVisits / analytics.totalVisitors) * 100 * 100) / 100
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.dashboardVisits} of {analytics.totalVisitors} visitors
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Micro-Conversions Card */}
          {analytics?.microConversions && (
            <div className="bg-card border border-primary/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Micro-Conversions Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Pricing Clicks</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{analytics.microConversions.pricingClicks}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.microConversions.pricingClickRate}% of visitors
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">CTA Clicks</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{analytics.microConversions.ctaClicks}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalVisitors > 0 
                      ? Math.round((analytics.microConversions.ctaClicks / analytics.totalVisitors) * 100 * 100) / 100
                      : 0}% click rate
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Scroll className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Avg Scroll Depth</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{analytics.microConversions.avgScrollDepth}%</p>
                  <p className="text-xs text-muted-foreground mt-1">How far users scroll</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Avg Time on Page</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.floor(analytics.microConversions.avgTimeOnPage / 60)}m {analytics.microConversions.avgTimeOnPage % 60}s
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Average engagement time</p>
                </div>
              </div>

              {/* Scroll Depth Distribution */}
              <div className="mt-4">
                <p className="text-sm font-bold text-foreground mb-3">Scroll Depth Distribution</p>
                <div className="grid grid-cols-4 gap-2">
                  {analytics.microConversions.scrollDepthDistribution.map((item, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3 border border-border text-center">
                      <p className="text-xs text-muted-foreground mb-1">{item.range}</p>
                      <p className="text-lg font-bold text-foreground">{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visitor Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Visitor Logs</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Showing 50 most recent records (quota optimized)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAnalytics(undefined, undefined, true, true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
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
                onChange={(e) => setPageFilter(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Pages</option>
                <option value="home">Home</option>
                <option value="login">Login</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP / Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Ago</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {isRefreshing ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`loading-${idx}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-muted rounded w-40"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-28"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </td>
                      </tr>
                    ))
                  ) : analytics?.visitorLogs && analytics.visitorLogs.length > 0 ? (
                    (() => {
                      // Get admin session IDs from login logs
                      const adminSessionIds = new Set<string>();
                      analytics.loginLogs?.forEach(log => {
                        if (log.userEmail && ADMIN_EMAILS.includes(log.userEmail) && log.sessionId) {
                          adminSessionIds.add(log.sessionId);
                        }
                      });
                      
                      // Also check current admin session ID
                      const currentAdminSessionId = typeof window !== "undefined" ? getOrCreateSessionId() : null;
                      if (currentAdminSessionId) {
                        adminSessionIds.add(currentAdminSessionId);
                      }

                      // Group by session ID to identify repeat visitors
                      const sessionCounts: { [key: string]: number } = {};
                      analytics.visitorLogs.forEach(log => {
                        if (log.sessionId) {
                          sessionCounts[log.sessionId] = (sessionCounts[log.sessionId] || 0) + 1;
                        }
                      });

                      return analytics.visitorLogs.map((log) => {
                        const logDate = new Date(log.timestamp);
                        const timeAgo = Math.floor((Date.now() - logDate.getTime()) / 1000);
                        const formatTimeAgo = () => {
                          if (timeAgo < 60) return `${timeAgo}s ago`;
                          if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
                          if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
                          return `${Math.floor(timeAgo / 86400)}d ago`;
                        };

                        const isAdminSession = log.sessionId && adminSessionIds.has(log.sessionId);
                        const isRepeatVisitor = log.sessionId && sessionCounts[log.sessionId] > 1;
                        const deviceType = log.deviceInfo?.userAgent 
                          ? (log.deviceInfo.userAgent.includes("Mobile") ? "Mobile" : "Desktop")
                          : "Unknown";
                        
                        return (
                          <tr key={log.id} className={`hover:bg-accent transition-colors ${isRepeatVisitor ? "bg-primary/5" : ""}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                              {logDate.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium">
                                <Globe className="w-3 h-3" />
                                {log.page}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {log.sessionId ? (
                                <div className="flex items-center gap-2">
                                  {isAdminSession ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/30 text-primary text-xs font-medium">
                                      <Shield className="w-3 h-3" />
                                      admin
                                    </span>
                                  ) : (
                                    <>
                                      <span className="font-mono text-xs text-primary break-all">
                                        {log.sessionId}
                                      </span>
                                      {isRepeatVisitor && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/30 text-primary text-[10px] font-medium shrink-0">
                                          <Repeat className="w-3 h-3" />
                                          {sessionCounts[log.sessionId]}x
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex flex-col gap-1">
                                {log.ipAddress ? (
                                  <div className="flex items-center gap-1">
                                    <Network className="w-3 h-3 text-muted-foreground" />
                                    <span className="font-mono text-xs text-foreground/80">
                                      {log.ipAddress}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                                {log.country && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    <span className="text-xs text-foreground/80">
                                      {log.country}
                                      {log.countryCode && (
                                        <span className="text-muted-foreground ml-1">
                                          ({log.countryCode})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground/80 text-xs">
                                  {deviceType}
                                  {log.deviceInfo?.screenWidth && (
                                    <span className="text-muted-foreground ml-1">
                                      ({log.deviceInfo.screenWidth}x{log.deviceInfo.screenHeight})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {formatTimeAgo()}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
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
              <LogIn className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Login Logs</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Showing 50 most recent records (quota optimized)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Showing {analytics?.loginLogs?.length || 0} login attempts
              </div>
              <button
                onClick={() => fetchAnalytics(undefined, undefined, true, true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP / Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Ago</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {isRefreshing ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`loading-login-${idx}`} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-48"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 bg-muted rounded w-40"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-32"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-28"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </td>
                      </tr>
                    ))
                  ) : analytics?.loginLogs && analytics.loginLogs.length > 0 ? (
                    analytics.loginLogs.map((log) => {
                      const logDate = new Date(log.timestamp);
                      const timeAgo = Math.floor((Date.now() - logDate.getTime()) / 1000);
                      const formatTimeAgo = () => {
                        if (timeAgo < 60) return `${timeAgo}s ago`;
                        if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
                        if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
                        return `${Math.floor(timeAgo / 86400)}d ago`;
                      };

                      const isAdminEmail = log.userEmail && ADMIN_EMAILS.includes(log.userEmail);
                      const deviceType = log.deviceInfo?.userAgent 
                        ? (log.deviceInfo.userAgent.includes("Mobile") ? "Mobile" : "Desktop")
                        : "Unknown";
                      
                      return (
                        <tr key={log.id} className="hover:bg-accent transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                            {logDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">
                            {log.userEmail || (
                              <span className="text-muted-foreground italic">Anonymous</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {log.sessionId ? (
                              isAdminEmail ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/30 text-primary text-xs font-medium">
                                  <Shield className="w-3 h-3" />
                                  admin
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-primary break-all">
                                  {log.sessionId}
                                </span>
                              )
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                              {log.ipAddress ? (
                                <div className="flex items-center gap-1">
                                  <Network className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-mono text-xs text-foreground/80">
                                    {log.ipAddress}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                              {log.country && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-primary" />
                                  <span className="text-xs text-foreground/80">
                                    {log.country}
                                    {log.countryCode && (
                                      <span className="text-muted-foreground ml-1">
                                        ({log.countryCode})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground/80 text-xs">
                                {deviceType}
                                {log.deviceInfo?.screenWidth && (
                                  <span className="text-muted-foreground ml-1">
                                    ({log.deviceInfo.screenWidth}x{log.deviceInfo.screenHeight})
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatTimeAgo()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No login logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lifetime Access Purchases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Lifetime Access Purchases</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Monitor the 20 limited lifetime slots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Purchased:</span>
                <span className="font-bold text-primary ml-1">{lifetimePurchases.length}/20</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{20 - lifetimePurchases.length} slots remaining</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-primary/30 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchased At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Ago</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {lifetimePurchases.length > 0 ? (
                    lifetimePurchases.map((purchase) => {
                      const purchaseDate = new Date(purchase.purchased_at);
                      const timeAgo = Math.floor((Date.now() - purchaseDate.getTime()) / 1000);
                      const formatTimeAgo = () => {
                        if (timeAgo < 60) return `${timeAgo}s ago`;
                        if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)}m ago`;
                        if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)}h ago`;
                        return `${Math.floor(timeAgo / 86400)}d ago`;
                      };
                      
                      return (
                        <tr key={purchase.id} className="hover:bg-accent transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                            {purchaseDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80 font-mono">
                            {purchase.order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80 font-mono">
                            {purchase.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                            {purchase.currency === 'IDR' ? 'Rp' : '$'}{Number(purchase.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatTimeAgo()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No lifetime purchases yet
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card border border-border rounded-xl shadow-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((appUser) => (
                <tr key={appUser.uid} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{appUser.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{new Date(appUser.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80 capitalize">{appUser.subscription?.plan || "Free"}</td>
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