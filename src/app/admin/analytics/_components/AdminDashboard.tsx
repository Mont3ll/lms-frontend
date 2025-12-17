"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { fetchAdminAnalytics, fetchTenants, type AdminAnalyticsParams } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { AdminAnalyticsData, Tenant } from "@/lib/types";

// Color schemes for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PUBLISHED: "#22c55e",
  ARCHIVED: "#f59e0b",
};

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedTenant, setSelectedTenant] = useState("all");

  // Fetch tenants for filter dropdown
  const { data: tenantsData } = useQuery({
    queryKey: [QUERY_KEYS.TENANTS],
    queryFn: () => fetchTenants({ page_size: 100 }),
  });

  const tenants = tenantsData?.results || [];

  // Fetch admin analytics
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery<AdminAnalyticsData>({
    queryKey: QUERY_KEYS.ADMIN_ANALYTICS(timeRange, selectedTenant !== "all" ? selectedTenant : undefined),
    queryFn: () =>
      fetchAdminAnalytics({
        time_range: timeRange,
        tenant_id: selectedTenant !== "all" ? selectedTenant : undefined,
      } as AdminAnalyticsParams),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No analytics data available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tenant:</span>
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Tenants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              {tenants.map((tenant: Tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers}
          subValue={`${analyticsData.overview.activeUsers24h} active (24h)`}
          icon={Users}
          trend={analyticsData.overview.newUsers}
          trendLabel="new this period"
        />
        <StatCard
          title="Total Tenants"
          value={analyticsData.overview.totalTenants}
          icon={Building2}
        />
        <StatCard
          title="Total Courses"
          value={analyticsData.overview.totalCourses}
          icon={BookOpen}
        />
        <StatCard
          title="Total Enrollments"
          value={analyticsData.overview.totalEnrollments}
          subValue={`${analyticsData.overview.avgCompletionRate.toFixed(1)}% avg completion`}
          icon={GraduationCap}
          trend={analyticsData.overview.newEnrollments}
          trendLabel="new this period"
        />
      </div>

      {/* Real-time Stats */}
      <RealTimeStats data={analyticsData.realTimeStats} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Activity - Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Events by Type
            </CardTitle>
            <CardDescription>Distribution of system events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.systemActivity.eventsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }: { type: string; percent: number }) =>
                    `${type} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {analyticsData.systemActivity.eventsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Comparison Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tenant Comparison
          </CardTitle>
          <CardDescription>
            Performance metrics across all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tenant</th>
                  <th className="text-right py-3 px-4 font-medium">Users</th>
                  <th className="text-right py-3 px-4 font-medium">Courses</th>
                  <th className="text-right py-3 px-4 font-medium">Enrollments</th>
                  <th className="text-right py-3 px-4 font-medium">Active</th>
                  <th className="text-right py-3 px-4 font-medium">Completed</th>
                  <th className="text-right py-3 px-4 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.tenantComparison.map((tenant) => {
                  const completionRate =
                    tenant.enrollments > 0
                      ? ((tenant.completedEnrollments / tenant.enrollments) * 100).toFixed(1)
                      : "0";
                  return (
                    <tr key={tenant.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tenant.slug}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{tenant.users}</td>
                      <td className="text-right py-3 px-4">{tenant.courses}</td>
                      <td className="text-right py-3 px-4">{tenant.enrollments}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary">{tenant.activeEnrollments}</Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {tenant.completedEnrollments}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={parseFloat(completionRate)} className="w-16 h-2" />
                          <span className="text-xs">{completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Login Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Login Frequency
            </CardTitle>
            <CardDescription>Daily user logins over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.systemActivity.loginFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip />
                <Line
                  type="monotone"
                  dataKey="logins"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Logins"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Usage Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Peak Usage Times
            </CardTitle>
            <CardDescription>Hourly activity distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.systemActivity.peakUsageTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickFormatter={(h) => `${h}:00`} />
                <YAxis />
                <ChartTooltip labelFormatter={(h) => `${h}:00`} />
                <Bar dataKey="events" fill="#8884d8" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Popular Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
            <CardDescription>Most enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.courseMetrics.popularCourses.slice(0, 5).map((course, index) => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{course.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {course.instructor} - {course.tenant}
                    </div>
                  </div>
                  <Badge variant="secondary">{course.enrollments}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rates</CardTitle>
            <CardDescription>Course completion performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.courseMetrics.completionRates.slice(0, 5).map((course) => (
                <div key={course.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">{course.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {course.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {course.totalEnrollments} enrollments
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courses by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Courses by Status</CardTitle>
            <CardDescription>Distribution of course statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.courseMetrics.coursesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {analyticsData.courseMetrics.coursesByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || COLORS[0]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic & Device Distribution */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>User distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.geographicData.slice(0, 8).map((region) => (
                <div key={`${region.country}-${region.region}`} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{region.country}</span>
                    {region.region && (
                      <span className="text-muted-foreground ml-1">({region.region})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{region.users}</span>
                      <span className="text-muted-foreground ml-1">users</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {region.events} events
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Usage
            </CardTitle>
            <CardDescription>Platform access by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.deviceUsage.map((device) => {
                const DeviceIcon =
                  device.device.toLowerCase() === "mobile"
                    ? Smartphone
                    : device.device.toLowerCase() === "tablet"
                    ? Tablet
                    : Monitor;

                return (
                  <div key={device.device} className="flex items-center gap-4">
                    <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{device.device}</span>
                        <span className="text-sm">{device.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                      {device.users} users
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
}

function StatCard({ title, value, subValue, icon: Icon, trend, trendLabel }: StatCardProps) {
  const isPositiveTrend = trend && trend > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        {trend !== undefined && trendLabel && (
          <p className="text-xs mt-1">
            <span
              className={`inline-flex items-center ${
                isPositiveTrend ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositiveTrend ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {isPositiveTrend ? "+" : ""}
              {trend} {trendLabel}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Real-time Stats Component
function RealTimeStats({ data }: { data: AdminAnalyticsData["realTimeStats"] }) {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Real-time Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{data.activeSessions}</div>
            <div className="text-sm text-muted-foreground">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data.currentLogins}</div>
            <div className="text-sm text-muted-foreground">Current Logins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.eventsLastHour}</div>
            <div className="text-sm text-muted-foreground">Events (Last Hour)</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Latest Events</div>
            <div className="space-y-1">
              {data.latestEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="text-xs">
                  <span className="font-medium">{event.type}</span>
                  <span className="text-muted-foreground"> - {event.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loading Component
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
