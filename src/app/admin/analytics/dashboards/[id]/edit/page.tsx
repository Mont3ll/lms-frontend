"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCustomDashboardDetail,
  updateCustomDashboard,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardEditor } from "../../../_components/DashboardEditor";
import type { DashboardUpdateData } from "@/lib/types";

export default function EditDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const dashboardId = params.id as string;
  const queryClient = useQueryClient();

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

  const updateMutation = useMutation({
    mutationFn: (data: DashboardUpdateData) =>
      updateCustomDashboard(dashboardId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOM_DASHBOARD_DETAIL(dashboardId),
      });
      toast.success("Dashboard updated successfully!");
      router.push(`/admin/analytics/dashboards/${data.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || "Failed to update dashboard");
    },
  });

  const handleSave = async (data: DashboardUpdateData) => {
    // Widgets are included in the DashboardUpdateData
    await updateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <PageWrapper
        title="Edit Dashboard"
        description="Loading dashboard..."
        className="h-[calc(100vh-8rem)]"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-80 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="flex-1 h-[500px]" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isError || !dashboard) {
    return (
      <PageWrapper
        title="Edit Dashboard"
        description="There was a problem loading the dashboard."
        className="h-[calc(100vh-8rem)]"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive mb-4">
            {getApiErrorMessage(error) || "Failed to load dashboard"}
          </p>
          <Button asChild>
            <Link href="/admin/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Analytics
            </Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Edit: ${dashboard.name}`}
      description="Modify your dashboard layout and widgets."
      className="h-[calc(100vh-8rem)]"
    >
      <DashboardEditor
        dashboard={dashboard}
        isEditing={true}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </PageWrapper>
  );
}
