"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCustomDashboard } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { DashboardEditor } from "../../_components/DashboardEditor";
import type { DashboardCreateData, DashboardUpdateData } from "@/lib/types";

export default function CreateDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCustomDashboard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      toast.success("Dashboard created successfully!");
      router.push(`/admin/analytics/dashboards/${data.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || "Failed to create dashboard");
    },
  });

  const handleSave = async (data: DashboardCreateData | DashboardUpdateData) => {
    // For new dashboards, cast to DashboardCreateData (all fields are required)
    await createMutation.mutateAsync(data as DashboardCreateData);
  };

  return (
    <PageWrapper
      title="Create Dashboard"
      description="Design a new custom analytics dashboard with widgets."
      className="h-[calc(100vh-8rem)]"
    >
      <DashboardEditor
        isEditing={false}
        onSave={handleSave}
        isSaving={createMutation.isPending}
      />
    </PageWrapper>
  );
}
