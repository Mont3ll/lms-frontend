"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "./_components/ReportViewer";
import { AdminDashboard } from "./_components/AdminDashboard";
import { DashboardCard } from "./_components/DashboardCard";
import { EventLogViewer } from "@/components/analytics/EventLogViewer";
import {
  fetchReportDefinitions,
  fetchDashboardDefinitions,
  fetchCustomDashboards,
  cloneCustomDashboard,
  deleteCustomDashboard,
  setCustomDashboardDefault,
  shareCustomDashboard,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LayoutDashboard, FileText, ScrollText, BarChart2, PieChart, Plus } from "lucide-react";
import type { Report, Dashboard, DashboardListItem, PaginatedResponse } from "@/lib/types";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "event-log" ? "events" : tabParam === "reports" ? "reports" : tabParam === "dashboards" ? "dashboards" : "overview";

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [dashboardToDelete, setDashboardToDelete] = React.useState<DashboardListItem | null>(null);

  const {
    data: reports = [],
    isLoading: isLoadingReports,
  } = useQuery<Report[]>({
    queryKey: [QUERY_KEYS.REPORT_DEFINITIONS],
    queryFn: fetchReportDefinitions,
  });

  const {
    data: dashboards = [],
    isLoading: isLoadingDashboards,
  } = useQuery<Dashboard[]>({
    queryKey: [QUERY_KEYS.DASHBOARD_DEFINITIONS],
    queryFn: fetchDashboardDefinitions,
  });

  // Custom dashboards query
  const {
    data: customDashboardsData,
    isLoading: isLoadingCustomDashboards,
  } = useQuery<PaginatedResponse<DashboardListItem>>({
    queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS,
    queryFn: () => fetchCustomDashboards(),
  });
  const customDashboards = customDashboardsData?.results ?? [];

  // Clone dashboard mutation
  const cloneMutation = useMutation({
    mutationFn: (dashboardId: string) => cloneCustomDashboard(dashboardId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      toast.success(`Dashboard "${data.name}" cloned successfully`);
    },
    onError: () => {
      toast.error("Failed to clone dashboard");
    },
  });

  // Delete dashboard mutation
  const deleteMutation = useMutation({
    mutationFn: (dashboardId: string) => deleteCustomDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      toast.success("Dashboard deleted successfully");
      setDeleteDialogOpen(false);
      setDashboardToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete dashboard");
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (dashboardId: string) => setCustomDashboardDefault(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      toast.success("Default dashboard updated");
    },
    onError: () => {
      toast.error("Failed to set default dashboard");
    },
  });

  // Toggle share mutation
  const toggleShareMutation = useMutation({
    mutationFn: ({ dashboardId, isShared }: { dashboardId: string; isShared: boolean }) =>
      shareCustomDashboard(dashboardId, { is_shared: !isShared }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_DASHBOARDS });
      toast.success(variables.isShared ? "Dashboard is now private" : "Dashboard is now shared");
    },
    onError: () => {
      toast.error("Failed to update sharing settings");
    },
  });

  // Dashboard action handlers
  const handleViewDashboard = (dashboard: DashboardListItem) => {
    router.push(`/admin/analytics/dashboards/${dashboard.id}`);
  };

  const handleEditDashboard = (dashboard: DashboardListItem) => {
    router.push(`/admin/analytics/dashboards/${dashboard.id}/edit`);
  };

  const handleCloneDashboard = (dashboard: DashboardListItem) => {
    cloneMutation.mutate(dashboard.id);
  };

  const handleDeleteDashboard = (dashboard: DashboardListItem) => {
    setDashboardToDelete(dashboard);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (dashboardToDelete) {
      deleteMutation.mutate(dashboardToDelete.id);
    }
  };

  const handleSetDefault = (dashboard: DashboardListItem) => {
    setDefaultMutation.mutate(dashboard.id);
  };

  const handleToggleShare = (dashboard: DashboardListItem) => {
    toggleShareMutation.mutate({ dashboardId: dashboard.id, isShared: dashboard.is_shared });
  };

  const handleCreateDashboard = () => {
    router.push("/admin/analytics/dashboards/new");
  };

  const isLoading = isLoadingReports || isLoadingDashboards || isLoadingCustomDashboards;

  if (isLoading) {
    return (
      <PageWrapper 
        title="Analytics & Reports"
        description="Monitor platform activity, generate reports, and track key performance metrics across all tenants."
      >
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

  return (
    <PageWrapper 
      title="Analytics & Reports"
      description="Monitor platform activity, generate reports, and track key performance metrics across all tenants."
    >
      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboards.length}</p>
                <p className="text-sm text-muted-foreground">Available Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Available Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-sm text-muted-foreground">Event Tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Custom Dashboards
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <ScrollText className="h-4 w-4" />
            Event Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Custom Dashboards</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage personalized analytics dashboards
              </p>
            </div>
            <Button onClick={handleCreateDashboard} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Dashboard
            </Button>
          </div>
          {customDashboards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customDashboards.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  dashboard={dashboard}
                  onView={handleViewDashboard}
                  onEdit={handleEditDashboard}
                  onClone={handleCloneDashboard}
                  onDelete={handleDeleteDashboard}
                  onSetDefault={handleSetDefault}
                  onToggleShare={handleToggleShare}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">No custom dashboards yet</p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1 mb-4">
                  Create your first dashboard to visualize your analytics data
                </p>
                <Button onClick={handleCreateDashboard} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {report.name}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReportViewer reportSlug={report.slug} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">No reports configured yet</p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1">
                  Reports will appear here once they are set up
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                Event Log
              </CardTitle>
              <CardDescription>
                Real-time platform events and analytics data. Filter and search through user activities, system events, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventLogViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{dashboardToDelete?.name}&quot;? This action
              cannot be undone and all widgets in this dashboard will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
