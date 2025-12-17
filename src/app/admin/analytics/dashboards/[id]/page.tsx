"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Pencil, AlertTriangle } from "lucide-react";
import { fetchCustomDashboardDetail, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { DashboardViewer } from "../../_components/DashboardViewer";

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.CUSTOM_DASHBOARD_DETAIL(dashboardId),
    queryFn: () => fetchCustomDashboardDetail(dashboardId),
    enabled: !!dashboardId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between pb-4 border-b mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-12 gap-4">
          <Skeleton className="col-span-4 h-40" />
          <Skeleton className="col-span-4 h-40" />
          <Skeleton className="col-span-4 h-40" />
          <Skeleton className="col-span-6 h-64" />
          <Skeleton className="col-span-6 h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-4 pb-4 border-b mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </div>
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load dashboard</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No dashboard found
  if (!dashboard) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-4 pb-4 border-b mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Dashboard not found</p>
            <p className="text-sm mt-1">
              The dashboard you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/admin/analytics">Return to Analytics</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-sm text-muted-foreground">
                {dashboard.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/analytics/dashboards/${dashboardId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Viewer */}
      <DashboardViewer dashboard={dashboard} />
    </div>
  );
}
