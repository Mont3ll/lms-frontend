"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layouts/PageWrapper';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  BookOpen, 
  Activity, 
  BarChart3, 
  ListChecks,
  Bell,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  UserPlus,
  GraduationCap,
  Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { fetchAdminDashboardStats } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { AdminDashboardStats } from '@/lib/types/index';
import { formatDateTime } from '@/lib/utils';

// Helper to render skeletons for stat cards
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-1/3 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </CardContent>
  </Card>
);

// Helper to render skeletons for chart/list cards
const ContentCardSkeleton = ({ titleLines = 1, contentHeight = "h-[300px]" }) => (
  <Card>
    <CardHeader>
      {Array.from({ length: titleLines }).map((_, i) => <Skeleton key={i} className="h-5 w-3/5 mb-2" />)}
    </CardHeader>
    <CardContent>
      <Skeleton className={`${contentHeight} w-full`} />
    </CardContent>
  </Card>
);


export default function AdminDashboard() {
  const router = useRouter();
  
  const { data: stats, isLoading, error, isError } = useQuery<AdminDashboardStats>({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD_STATS],
    queryFn: fetchAdminDashboardStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <PageWrapper title="Admin Dashboard" description="Loading platform statistics and metrics.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <div className="lg:col-span-4"><ContentCardSkeleton titleLines={2} /></div>
          <div className="lg:col-span-3"><ContentCardSkeleton titleLines={2} contentHeight="h-[200px]" /></div>
        </div>
      </PageWrapper>
    );
  }

  if (isError || !stats) { // Added !stats check for type safety
    return (
      <PageWrapper title="Admin Dashboard" description="There was a problem loading dashboard data.">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Data</AlertTitle>
          <AlertDescription>
            Could not fetch administrative statistics. Please try refreshing the page or contact support if the issue persists.
            {error && <pre className="mt-2 text-xs whitespace-pre-wrap">{error.message}</pre>}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Admin Dashboard" description="Monitor platform health, manage tenants, and track key metrics across your learning management system.">
      {/* Platform Alerts Section - Always at top if there are alerts */}
      {(stats.platformAlerts?.length ?? 0) > 0 && (
        <div className="mb-6">
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Bell className="h-5 w-5" />
                Platform Alerts
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.platformAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'high' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                          : alert.severity === 'medium'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(alert.actionUrl)}
                      className="shrink-0"
                    >
                      {alert.actionLabel}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats Banner */}
      {stats.quickStats && (
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">This Week&apos;s Activity</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.quickStats.newUsersThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">New Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.quickStats.newEnrollmentsThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.quickStats.coursesPublishedThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Courses Published</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.quickStats.activeTenantsThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Active Tenants</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.quickStats.coursesCompletedThisWeek}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Completions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tenants" value={stats.totalTenants} icon={Building} description="Active organizations" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} description="Across all tenants" />
        <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} description="Platform-wide" />
        <StatCard title="Active Users (Today)" value={stats.activeUsersToday} icon={Activity} description="Users logged in" />
      </div>

      {/* Tenants Needing Attention */}
      {(stats.tenantsNeedingAttention?.length ?? 0) > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Tenants Needing Attention
              </CardTitle>
              <CardDescription>Organizations that may need intervention or support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.tenantsNeedingAttention.slice(0, 5).map((tenant, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/tenants/${tenant.tenantId}/edit`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{tenant.tenantName}</p>
                      </div>
                      <Badge 
                        variant={tenant.severity === 'high' ? 'destructive' : tenant.severity === 'medium' ? 'default' : 'secondary'}
                      >
                        {tenant.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1 ml-6">
                      {tenant.issues.slice(0, 2).map((issue, issueIndex) => (
                        <div key={issueIndex} className="text-xs text-muted-foreground">
                          <span className="font-medium">{issue.message}</span>
                          <span className="text-muted-foreground/70"> - {issue.suggestion}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 ml-6 text-xs text-muted-foreground">
                      <span>{tenant.totalUsers} users</span>
                      <span>{tenant.totalCourses} courses</span>
                      <span>{tenant.totalEnrollments} enrollments</span>
                    </div>
                  </div>
                ))}
              </div>
              {stats.tenantsNeedingAttention.length > 5 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-3" 
                  onClick={() => router.push('/admin/tenants')}
                >
                  View All Tenants
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Events Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4 border-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                User Growth
              </CardTitle>
              {stats.userGrowth && stats.userGrowth.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stats.userGrowth[stats.userGrowth.length - 1]?.users.toLocaleString()} total
                </Badge>
              )}
            </div>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.userGrowth && stats.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false} 
                    axisLine={false}
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    tickFormatter={(value) => value.toLocaleString()}
                    width={60}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number) => [value.toLocaleString(), 'Users']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Total Users" 
                    stroke="#3b82f6"
                    strokeWidth={2.5} 
                    activeDot={{ r: 6, fill: '#3b82f6' }} 
                    dot={false}
                    fill="url(#userGrowthGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <BarChart3 className="h-12 w-12 opacity-20" />
                <p>No user growth data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />Recent System Events</CardTitle>
            <CardDescription>Latest important administrative activities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {stats.recentSystemEvents && stats.recentSystemEvents.length > 0 ? stats.recentSystemEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-b-0 last:pb-0">
                <Activity className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="font-medium">{event.description}</p>
                  <span className="text-xs text-muted-foreground">{event.type.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(event.timestamp)}</span>
              </div>
            )) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No recent system events.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health Status - Show when everything is healthy */}
      {(stats.platformAlerts?.length ?? 0) === 0 && (stats.tenantsNeedingAttention?.length ?? 0) === 0 && (
        <div className="mt-6">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">All Systems Healthy</p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">No immediate issues requiring attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
