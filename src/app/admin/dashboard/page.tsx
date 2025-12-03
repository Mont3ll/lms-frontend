"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layouts/PageWrapper';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, BookOpen, Activity, BarChart3, ListChecks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Example charting

import { fetchAdminDashboardStats } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { AdminDashboardStats } from '@/lib/types/index'; // Import the type
import { formatDateTime } from '@/lib/utils'; // For event timestamps

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
  const { data: stats, isLoading, error, isError } = useQuery<AdminDashboardStats>({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD_STATS],
    queryFn: fetchAdminDashboardStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <PageWrapper title="Admin Dashboard">
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
      <PageWrapper title="Admin Dashboard">
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
    <PageWrapper title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tenants" value={stats.totalTenants} icon={Building} description="Active organizations" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} description="Across all tenants" />
        <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} description="Platform-wide" />
        <StatCard title="Active Users (Today)" value={stats.activeUsersToday} icon={Activity} description="Users logged in" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />User Growth</CardTitle>
            <CardDescription>Total registered users over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-6"> {/* Adjust padding for Recharts */}
            {stats.userGrowth && stats.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.userGrowth} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="users" name="Total Users" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No user growth data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />Recent System Events</CardTitle>
            <CardDescription>Latest important administrative activities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto"> {/* Added scroll for long lists */}
            {stats.recentSystemEvents && stats.recentSystemEvents.length > 0 ? stats.recentSystemEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-b-0 last:pb-0">
                <Activity className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <span className="font-medium">{event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
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
    </PageWrapper>
  );
}
