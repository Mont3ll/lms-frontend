"use client";

import React, { useMemo, useCallback } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout/legacy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Table2,
  TrendingUp,
  Award,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetType } from "@/lib/types";
import type { EditorWidget } from "./DashboardEditor";

// Import react-grid-layout styles
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

/** Grid configuration */
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const GRID_ROW_HEIGHT = 80;
const GRID_MARGIN: [number, number] = [16, 16];

/** Widget type icons */
const WIDGET_ICONS: Record<WidgetType, React.ReactNode> = {
  stat_card: <TrendingUp className="h-4 w-4" />,
  line_chart: <LineChart className="h-4 w-4" />,
  bar_chart: <BarChart3 className="h-4 w-4" />,
  pie_chart: <PieChart className="h-4 w-4" />,
  area_chart: <Activity className="h-4 w-4" />,
  table: <Table2 className="h-4 w-4" />,
  progress_ring: <CircleDot className="h-4 w-4" />,
  leaderboard: <Award className="h-4 w-4" />,
};

/** Widget type labels */
const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  stat_card: "Stat Card",
  line_chart: "Line Chart",
  bar_chart: "Bar Chart",
  pie_chart: "Pie Chart",
  area_chart: "Area Chart",
  table: "Table",
  progress_ring: "Progress Ring",
  leaderboard: "Leaderboard",
};

interface DashboardGridProps {
  /** Widgets to display */
  widgets: EditorWidget[];
  /** Called when layout changes (drag/resize) */
  onLayoutChange?: (
    layout: { i: string; x: number; y: number; w: number; h: number }[]
  ) => void;
  /** Called when edit is clicked on a widget */
  onEditWidget?: (widget: EditorWidget) => void;
  /** Called when delete is clicked on a widget */
  onDeleteWidget?: (tempId: string) => void;
  /** Whether we're in edit mode (draggable/resizable) */
  isEditing?: boolean;
}

export function DashboardGrid({
  widgets,
  onLayoutChange,
  onEditWidget,
  onDeleteWidget,
  isEditing = false,
}: DashboardGridProps) {
  // Convert widgets to react-grid-layout format
  const layout = useMemo<Layout>(
    () =>
      widgets.map((widget) => ({
        i: widget.tempId,
        x: widget.position_x ?? 0,
        y: widget.position_y ?? 0,
        w: widget.width ?? 4,
        h: widget.height ?? 3,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 8,
      })),
    [widgets]
  );

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback(
    (currentLayout: Layout) => {
      if (!onLayoutChange) return;
      onLayoutChange(
        currentLayout.map((item) => ({
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }))
      );
    },
    [onLayoutChange]
  );

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={GRID_COLS}
      rowHeight={GRID_ROW_HEIGHT}
      margin={GRID_MARGIN}
      onLayoutChange={handleLayoutChange}
      isDraggable={isEditing}
      isResizable={isEditing}
      draggableHandle=".drag-handle"
      useCSSTransforms={true}
      compactType="vertical"
    >
      {widgets.map((widget) => (
        <div key={widget.tempId}>
          <WidgetCard
            widget={widget}
            isEditing={isEditing}
            onEdit={() => onEditWidget?.(widget)}
            onDelete={() => onDeleteWidget?.(widget.tempId)}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}

interface WidgetCardProps {
  widget: EditorWidget;
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function WidgetCard({ widget, isEditing, onEdit, onDelete }: WidgetCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", isEditing && "cursor-default")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditing && (
            <div className="drag-handle cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="text-primary shrink-0">
            {WIDGET_ICONS[widget.widget_type]}
          </div>
          <CardTitle className="text-sm font-medium truncate">
            {widget.title}
          </CardTitle>
        </div>

        {isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Widget actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Edit Widget
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Placeholder content in edit mode */}
        <div className="text-center text-muted-foreground">
          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
            {WIDGET_ICONS[widget.widget_type]}
          </div>
          <p className="text-xs font-medium">
            {WIDGET_TYPE_LABELS[widget.widget_type]}
          </p>
          <p className="text-xs mt-1 opacity-70">
            {widget.data_source.replace(/_/g, " ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
