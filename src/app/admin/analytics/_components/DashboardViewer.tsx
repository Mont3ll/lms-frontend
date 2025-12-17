"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout/legacy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Maximize2,
  Minimize2,
  Clock,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Widget } from "./widgets/Widget";
import { DashboardFilters } from "./DashboardFilters";
import type {
  DashboardDetail,
  DashboardTimeRange,
} from "@/lib/types";

// Import react-grid-layout styles
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

/** Grid configuration (same as DashboardGrid for consistency) */
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const GRID_ROW_HEIGHT = 80;
const GRID_MARGIN: [number, number] = [16, 16];

interface DashboardViewerProps {
  /** Dashboard data with widgets */
  dashboard: DashboardDetail;
  /** Override tenant ID for filtering (super admin) */
  tenantId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DashboardViewer component renders a read-only view of a dashboard with
 * all its widgets, supports time range filtering, auto-refresh, and fullscreen mode.
 */
export function DashboardViewer({
  dashboard,
  tenantId: initialTenantId,
  className,
}: DashboardViewerProps) {
  // Filter state
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>(
    dashboard.default_time_range ?? "30d"
  );
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(
    initialTenantId
  );

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-refresh state
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(
    dashboard.refresh_interval > 0
  );
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate refresh interval in ms (0 = disabled)
  const refreshIntervalMs = isAutoRefreshing
    ? (dashboard.refresh_interval || 0) * 1000
    : 0;

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    setLastRefreshed(new Date());
  }, []);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshing((prev) => !prev);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
      }
    }
  }, []);

  // Listen for fullscreen changes (e.g., user pressing Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-refresh timer
  useEffect(() => {
    if (refreshIntervalMs <= 0) return;

    const intervalId = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
      setLastRefreshed(new Date());
    }, refreshIntervalMs);

    return () => clearInterval(intervalId);
  }, [refreshIntervalMs]);

  // Convert widgets to react-grid-layout format
  const layout: Layout = dashboard.widgets.map((widget) => ({
    i: widget.id,
    x: widget.position_x,
    y: widget.position_y,
    w: widget.width,
    h: widget.height,
    static: true, // Prevent dragging/resizing in view mode
  }));

  // Format last refreshed time
  const formatLastRefreshed = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefreshed.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastRefreshed.toLocaleTimeString();
  };

  // Get refresh interval label
  const getRefreshIntervalLabel = () => {
    const seconds = dashboard.refresh_interval;
    if (seconds === 0) return "Manual";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col h-full",
        isFullscreen && "bg-background",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        {/* Left: Filters */}
        <DashboardFilters
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          tenantId={selectedTenantId}
          onTenantChange={setSelectedTenantId}
        />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Last refresh indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
            <Clock className="h-3 w-3" />
            <span>{formatLastRefreshed()}</span>
          </div>

          {/* Auto-refresh toggle */}
          {dashboard.refresh_interval > 0 && (
            <Button
              variant={isAutoRefreshing ? "secondary" : "outline"}
              size="sm"
              onClick={toggleAutoRefresh}
              className="gap-1"
            >
              <RefreshCw
                className={cn("h-4 w-4", isAutoRefreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">
                {isAutoRefreshing ? "Auto" : "Manual"}
              </span>
              <Badge variant="outline" className="ml-1 text-xs">
                {getRefreshIntervalLabel()}
              </Badge>
            </Button>
          )}

          {/* Manual refresh button */}
          <Button variant="outline" size="sm" onClick={handleManualRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>

          {/* Fullscreen toggle */}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            </span>
          </Button>

          {/* Share badge if dashboard is shared */}
          {dashboard.is_shared && (
            <Badge variant="secondary" className="gap-1">
              <Share2 className="h-3 w-3" />
              Shared
            </Badge>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      {dashboard.widgets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <div>
            <p className="text-lg font-medium">No widgets configured</p>
            <p className="text-sm mt-1">
              Edit this dashboard to add widgets and visualizations.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ResponsiveGridLayout
            key={refreshKey} // Force re-render on refresh
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={GRID_COLS}
            rowHeight={GRID_ROW_HEIGHT}
            margin={GRID_MARGIN}
            isDraggable={false}
            isResizable={false}
            useCSSTransforms={true}
            compactType="vertical"
          >
            {dashboard.widgets.map((widget) => (
              <div key={widget.id}>
                <Widget
                  widget={widget}
                  timeRange={timeRange}
                  tenantId={selectedTenantId}
                  isEditMode={false}
                  refreshInterval={refreshIntervalMs}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}
    </div>
  );
}

export default DashboardViewer;
