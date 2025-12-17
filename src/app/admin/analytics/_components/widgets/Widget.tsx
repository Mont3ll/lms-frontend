"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetData } from "@/hooks/useWidgetData";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { StatCardWidget } from "./StatCardWidget";
import { LineChartWidget } from "./LineChartWidget";
import { BarChartWidget } from "./BarChartWidget";
import { PieChartWidget } from "./PieChartWidget";
import { AreaChartWidget } from "./AreaChartWidget";
import { TableWidget } from "./TableWidget";
import { ProgressRingWidget } from "./ProgressRingWidget";
import { LeaderboardWidget } from "./LeaderboardWidget";
import type { DashboardWidget, DashboardTimeRange } from "@/lib/types";

interface WidgetProps {
  /** Widget configuration from the dashboard */
  widget: DashboardWidget;
  /** Global time range for the dashboard */
  timeRange?: DashboardTimeRange;
  /** Tenant ID for filtering (super admin) */
  tenantId?: string;
  /** Whether the widget is in edit mode */
  isEditMode?: boolean;
  /** Auto-refresh interval in ms (0 to disable) */
  refreshInterval?: number;
  /** Callback when configure button is clicked */
  onConfigure?: () => void;
  /** Callback when delete button is clicked */
  onDelete?: () => void;
  /** Callback when duplicate button is clicked */
  onDuplicate?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main Widget component that handles data fetching and renders the appropriate
 * widget type based on configuration.
 */
export function Widget({
  widget,
  timeRange = "30d",
  tenantId,
  isEditMode = false,
  refreshInterval = 0,
  onConfigure,
  onDelete,
  onDuplicate,
  className,
}: WidgetProps) {
  const {
    data,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useWidgetData({
    widgetId: widget.id,
    timeRange,
    tenantId,
    refetchInterval: refreshInterval > 0 ? refreshInterval : undefined,
  });

  const renderWidgetContent = () => {
    // Show skeleton during initial load
    if (isLoading) {
      return <WidgetSkeleton widgetType={widget.widget_type} />;
    }

    // Show error state
    if (isError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Failed to load widget data"}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Render the appropriate widget type
    const widgetData = data?.data;
    const config = widget.config;

    switch (widget.widget_type) {
      case "stat_card":
        return <StatCardWidget data={widgetData} config={config} />;

      case "line_chart":
        return <LineChartWidget data={widgetData} config={config} />;

      case "bar_chart":
        return <BarChartWidget data={widgetData} config={config} />;

      case "pie_chart":
        return <PieChartWidget data={widgetData} config={config} />;

      case "area_chart":
        return <AreaChartWidget data={widgetData} config={config} />;

      case "table":
        return <TableWidget data={widgetData} config={config} />;

      case "progress_ring":
        return <ProgressRingWidget data={widgetData} config={config} />;

      case "leaderboard":
        return <LeaderboardWidget data={widgetData} config={config} />;

      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Unknown widget type: {widget.widget_type}
          </div>
        );
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden h-full",
        isRefetching && "opacity-75",
        className
      )}
    >
      <WidgetHeader
        title={widget.title}
        isEditMode={isEditMode}
        isRefreshing={isRefetching}
        onRefresh={() => refetch()}
        onConfigure={onConfigure}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        lastUpdated={data?.generated_at}
      />
      <div className="flex-1 overflow-auto">{renderWidgetContent()}</div>
    </Card>
  );
}

export default Widget;

// Re-export widget subcomponents for direct use if needed
export { WidgetHeader } from "./WidgetHeader";
export { WidgetSkeleton } from "./WidgetSkeleton";
