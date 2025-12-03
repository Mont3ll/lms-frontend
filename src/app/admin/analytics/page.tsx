"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportViewer } from "./_components/ReportViewer";
import { fetchReportDefinitions, fetchDashboardDefinitions } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DashboardDefinition {
  id: string;
  title: string;
  description: string;
  widget_count: number;
}

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  slug: string;
}

export default function AnalyticsPage() {
  const {
    data: reports = [],
    isLoading: isLoadingReports,
  } = useQuery<ReportDefinition[]>({
    queryKey: [QUERY_KEYS.REPORT_DEFINITIONS],
    queryFn: fetchReportDefinitions,
  });

  const {
    data: dashboards = [],
    isLoading: isLoadingDashboards,
  } = useQuery<DashboardDefinition[]>({
    queryKey: [QUERY_KEYS.DASHBOARD_DEFINITIONS],
    queryFn: fetchDashboardDefinitions,
  });

  const isLoading = isLoadingReports || isLoadingDashboards;

  if (isLoading) {
    return (
      <PageWrapper title="Analytics & Reports">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Check if analytics endpoints are not implemented yet
  const hasNoData = reports.length === 0 && dashboards.length === 0;

  if (hasNoData) {
    return (
      <PageWrapper title="Analytics & Reports">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Analytics Coming Soon</AlertTitle>
          <AlertDescription>
            Analytics and reporting features are currently being developed.
            These features will be available in a future update.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Analytics & Reports">
      <Tabs defaultValue="dashboards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="events">Event Log</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboards.length > 0 ? (
              dashboards.map((dashboard) => (
                <Card
                  key={dashboard.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {dashboard.widget_count} widgets
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No dashboards available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportViewer reportSlug={report.slug} />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No reports available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>
                Real-time platform events and analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Event log viewer component to be implemented
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
