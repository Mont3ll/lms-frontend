"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Table2,
  TrendingUp,
  Award,
  CircleDot,
} from "lucide-react";
import type { WidgetType, WidgetDataSource, WidgetConfig } from "@/lib/types";
import type { EditorWidget } from "./DashboardEditor";

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

/** Data source metadata */
const DATA_SOURCES: { source: WidgetDataSource; label: string }[] = [
  { source: "user_growth", label: "User Growth" },
  { source: "enrollment_stats", label: "Enrollment Statistics" },
  { source: "course_metrics", label: "Course Metrics" },
  { source: "completion_rates", label: "Completion Rates" },
  { source: "login_frequency", label: "Login Frequency" },
  { source: "peak_usage", label: "Peak Usage" },
  { source: "tenant_comparison", label: "Tenant Comparison" },
  { source: "device_usage", label: "Device Usage" },
  { source: "geographic_data", label: "Geographic Data" },
  { source: "events_by_type", label: "Events by Type" },
  { source: "popular_courses", label: "Popular Courses" },
  { source: "active_users", label: "Active Users" },
  { source: "recent_activity", label: "Recent Activity" },
];

interface WidgetConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: EditorWidget | null;
  onSave: (widget: EditorWidget) => void;
}

export function WidgetConfigModal({
  open,
  onOpenChange,
  widget,
  onSave,
}: WidgetConfigModalProps) {
  // Local state for editing
  const [title, setTitle] = useState("");
  const [dataSource, setDataSource] = useState<WidgetDataSource | "">("");
  const [config, setConfig] = useState<WidgetConfig>({});

  // Sync state when widget changes
  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setDataSource(widget.data_source);
      setConfig(widget.config || {});
    }
  }, [widget]);

  const handleSave = () => {
    if (!widget || !title || !dataSource) return;

    onSave({
      ...widget,
      title,
      data_source: dataSource as WidgetDataSource,
      config,
    });
  };

  const handleConfigChange = (key: keyof WidgetConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (!widget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {WIDGET_ICONS[widget.widget_type]}
            Edit {WIDGET_TYPE_LABELS[widget.widget_type]}
          </DialogTitle>
          <DialogDescription>
            Configure the widget settings and appearance.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title..."
              />
            </div>

            {/* Data Source */}
            <div className="space-y-2">
              <Label htmlFor="data-source">Data Source</Label>
              <Select
                value={dataSource}
                onValueChange={(val) => setDataSource(val as WidgetDataSource)}
              >
                <SelectTrigger id="data-source">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((ds) => (
                    <SelectItem key={ds.source} value={ds.source}>
                      {ds.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4 mt-4">
            {/* Conditional options based on widget type */}
            {widget.widget_type === "stat_card" && (
              <StatCardOptions config={config} onChange={handleConfigChange} />
            )}

            {(widget.widget_type === "line_chart" ||
              widget.widget_type === "bar_chart" ||
              widget.widget_type === "area_chart") && (
              <ChartOptions
                config={config}
                onChange={handleConfigChange}
                widgetType={widget.widget_type}
              />
            )}

            {widget.widget_type === "pie_chart" && (
              <PieChartOptions config={config} onChange={handleConfigChange} />
            )}

            {widget.widget_type === "table" && (
              <TableOptions config={config} onChange={handleConfigChange} />
            )}

            {widget.widget_type === "progress_ring" && (
              <ProgressRingOptions config={config} onChange={handleConfigChange} />
            )}

            {widget.widget_type === "leaderboard" && (
              <LeaderboardOptions config={config} onChange={handleConfigChange} />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !dataSource}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Options for Stat Card widget */
function StatCardOptions({
  config,
  onChange,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Show Trend</Label>
          <p className="text-xs text-muted-foreground">
            Display percentage change indicator
          </p>
        </div>
        <Switch
          checked={config.showTrend ?? true}
          onCheckedChange={(val) => onChange("showTrend", val)}
        />
      </div>

      <div className="space-y-2">
        <Label>Number Format</Label>
        <Select
          value={config.format ?? "number"}
          onValueChange={(val) => onChange("format", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

/** Options for Line/Bar/Area Chart widgets */
function ChartOptions({
  config,
  onChange,
  widgetType,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
  widgetType: WidgetType;
}) {
  return (
    <>
      {(widgetType === "bar_chart" || widgetType === "area_chart") && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label className="text-sm">Stacked</Label>
            <p className="text-xs text-muted-foreground">
              Stack data series on top of each other
            </p>
          </div>
          <Switch
            checked={config.stacked ?? false}
            onCheckedChange={(val) => onChange("stacked", val)}
          />
        </div>
      )}

      {widgetType === "bar_chart" && (
        <div className="space-y-2">
          <Label>Orientation</Label>
          <Select
            value={config.orientation ?? "vertical"}
            onValueChange={(val) => onChange("orientation", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="horizontal">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {widgetType === "area_chart" && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label className="text-sm">Gradient Fill</Label>
            <p className="text-xs text-muted-foreground">
              Apply gradient to area fill
            </p>
          </div>
          <Switch
            checked={config.gradient ?? true}
            onCheckedChange={(val) => onChange("gradient", val)}
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Show Legend</Label>
          <p className="text-xs text-muted-foreground">Display chart legend</p>
        </div>
        <Switch
          checked={config.showLegend ?? true}
          onCheckedChange={(val) => onChange("showLegend", val)}
        />
      </div>
    </>
  );
}

/** Options for Pie Chart widget */
function PieChartOptions({
  config,
  onChange,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Donut Style</Label>
          <p className="text-xs text-muted-foreground">
            Show as donut instead of pie
          </p>
        </div>
        <Switch
          checked={config.donut ?? false}
          onCheckedChange={(val) => onChange("donut", val)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Show Labels</Label>
          <p className="text-xs text-muted-foreground">Display value labels</p>
        </div>
        <Switch
          checked={config.showLabels ?? true}
          onCheckedChange={(val) => onChange("showLabels", val)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Show Legend</Label>
          <p className="text-xs text-muted-foreground">Display chart legend</p>
        </div>
        <Switch
          checked={config.showLegend ?? true}
          onCheckedChange={(val) => onChange("showLegend", val)}
        />
      </div>
    </>
  );
}

/** Options for Table widget */
function TableOptions({
  config,
  onChange,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Sortable</Label>
          <p className="text-xs text-muted-foreground">
            Allow sorting by columns
          </p>
        </div>
        <Switch
          checked={config.sortable ?? true}
          onCheckedChange={(val) => onChange("sortable", val)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Paginated</Label>
          <p className="text-xs text-muted-foreground">Enable pagination</p>
        </div>
        <Switch
          checked={config.paginated ?? false}
          onCheckedChange={(val) => onChange("paginated", val)}
        />
      </div>

      {config.paginated && (
        <div className="space-y-2">
          <Label>Page Size</Label>
          <Select
            value={String(config.pageSize ?? 10)}
            onValueChange={(val) => onChange("pageSize", parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}

/** Options for Progress Ring widget */
function ProgressRingOptions({
  config,
  onChange,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Target Value</Label>
        <Input
          type="number"
          value={config.target ?? 100}
          onChange={(e) => onChange("target", parseInt(e.target.value))}
          min={1}
          max={100}
        />
        <p className="text-xs text-muted-foreground">
          The target value to measure progress against
        </p>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <Select
          value={config.color ?? "primary"}
          onValueChange={(val) => onChange("color", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

/** Options for Leaderboard widget */
function LeaderboardOptions({
  config,
  onChange,
}: {
  config: WidgetConfig;
  onChange: (key: keyof WidgetConfig, value: unknown) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Number of Items</Label>
        <Select
          value={String(config.limit ?? 5)}
          onValueChange={(val) => onChange("limit", parseInt(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Top 3</SelectItem>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="15">Top 15</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">Show Rank Numbers</Label>
          <p className="text-xs text-muted-foreground">
            Display position numbers
          </p>
        </div>
        <Switch
          checked={config.showRank ?? true}
          onCheckedChange={(val) => onChange("showRank", val)}
        />
      </div>
    </>
  );
}
