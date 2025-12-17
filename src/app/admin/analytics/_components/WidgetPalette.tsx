"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Table2,
  TrendingUp,
  Award,
  CircleDot,
  Search,
} from "lucide-react";
import type { WidgetType, WidgetDataSource, WidgetCreateData } from "@/lib/types";

/** Widget type definition with metadata */
interface WidgetTypeInfo {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultWidth: number;
  defaultHeight: number;
  compatibleDataSources: WidgetDataSource[];
}

/** Data source definition with metadata */
interface DataSourceInfo {
  source: WidgetDataSource;
  label: string;
  description: string;
}

/** Widget types available in the palette */
const WIDGET_TYPES: WidgetTypeInfo[] = [
  {
    type: "stat_card",
    label: "Stat Card",
    description: "Display a single KPI with optional trend indicator",
    icon: <TrendingUp className="h-5 w-5" />,
    defaultWidth: 3,
    defaultHeight: 2,
    compatibleDataSources: [
      "user_growth",
      "enrollment_stats",
      "completion_rates",
      "active_users",
    ],
  },
  {
    type: "line_chart",
    label: "Line Chart",
    description: "Time-series data visualization",
    icon: <LineChart className="h-5 w-5" />,
    defaultWidth: 6,
    defaultHeight: 4,
    compatibleDataSources: [
      "user_growth",
      "enrollment_stats",
      "completion_rates",
      "login_frequency",
    ],
  },
  {
    type: "bar_chart",
    label: "Bar Chart",
    description: "Compare categorical data",
    icon: <BarChart3 className="h-5 w-5" />,
    defaultWidth: 6,
    defaultHeight: 4,
    compatibleDataSources: [
      "course_metrics",
      "events_by_type",
      "popular_courses",
      "tenant_comparison",
    ],
  },
  {
    type: "pie_chart",
    label: "Pie Chart",
    description: "Show distribution of data",
    icon: <PieChart className="h-5 w-5" />,
    defaultWidth: 4,
    defaultHeight: 4,
    compatibleDataSources: [
      "device_usage",
      "events_by_type",
      "geographic_data",
    ],
  },
  {
    type: "area_chart",
    label: "Area Chart",
    description: "Filled area time-series visualization",
    icon: <Activity className="h-5 w-5" />,
    defaultWidth: 6,
    defaultHeight: 4,
    compatibleDataSources: [
      "user_growth",
      "enrollment_stats",
      "completion_rates",
      "login_frequency",
    ],
  },
  {
    type: "table",
    label: "Data Table",
    description: "Tabular data display with sorting",
    icon: <Table2 className="h-5 w-5" />,
    defaultWidth: 6,
    defaultHeight: 4,
    compatibleDataSources: [
      "popular_courses",
      "recent_activity",
      "course_metrics",
    ],
  },
  {
    type: "progress_ring",
    label: "Progress Ring",
    description: "Circular progress indicator",
    icon: <CircleDot className="h-5 w-5" />,
    defaultWidth: 3,
    defaultHeight: 3,
    compatibleDataSources: [
      "completion_rates",
      "enrollment_stats",
    ],
  },
  {
    type: "leaderboard",
    label: "Leaderboard",
    description: "Ranked list of top items",
    icon: <Award className="h-5 w-5" />,
    defaultWidth: 4,
    defaultHeight: 5,
    compatibleDataSources: [
      "popular_courses",
      "active_users",
    ],
  },
];

/** Available data sources */
const DATA_SOURCES: DataSourceInfo[] = [
  {
    source: "user_growth",
    label: "User Growth",
    description: "User registration trends over time",
  },
  {
    source: "enrollment_stats",
    label: "Enrollment Statistics",
    description: "Course enrollment metrics",
  },
  {
    source: "course_metrics",
    label: "Course Metrics",
    description: "Course performance and engagement data",
  },
  {
    source: "completion_rates",
    label: "Completion Rates",
    description: "Course and module completion percentages",
  },
  {
    source: "login_frequency",
    label: "Login Frequency",
    description: "User login activity over time",
  },
  {
    source: "peak_usage",
    label: "Peak Usage",
    description: "Hourly activity distribution",
  },
  {
    source: "tenant_comparison",
    label: "Tenant Comparison",
    description: "Cross-tenant metric comparison",
  },
  {
    source: "device_usage",
    label: "Device Usage",
    description: "Device type distribution",
  },
  {
    source: "geographic_data",
    label: "Geographic Data",
    description: "User location distribution",
  },
  {
    source: "events_by_type",
    label: "Events by Type",
    description: "Breakdown of event types",
  },
  {
    source: "popular_courses",
    label: "Popular Courses",
    description: "Top courses by enrollment",
  },
  {
    source: "active_users",
    label: "Active Users",
    description: "Active user counts and trends",
  },
  {
    source: "recent_activity",
    label: "Recent Activity",
    description: "Latest user activities",
  },
];

interface WidgetPaletteProps {
  /** Called when a widget is selected and configured */
  onSelectWidget: (widget: Omit<WidgetCreateData, "order">) => void;
  /** Called when user cancels/closes the palette */
  onClose?: () => void;
}

type PaletteStep = "select-type" | "configure";

export function WidgetPalette({ onSelectWidget, onClose }: WidgetPaletteProps) {
  const [step, setStep] = useState<PaletteStep>("select-type");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<WidgetTypeInfo | null>(null);
  const [title, setTitle] = useState("");
  const [dataSource, setDataSource] = useState<WidgetDataSource | "">("");

  // Filter widget types based on search
  const filteredTypes = WIDGET_TYPES.filter(
    (wt) =>
      wt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get compatible data sources for selected widget type
  const compatibleDataSources = selectedType
    ? DATA_SOURCES.filter((ds) =>
        selectedType.compatibleDataSources.includes(ds.source)
      )
    : DATA_SOURCES;

  const handleSelectType = (widgetType: WidgetTypeInfo) => {
    setSelectedType(widgetType);
    setTitle(`${widgetType.label}`);
    // Auto-select first compatible data source
    if (widgetType.compatibleDataSources.length > 0) {
      setDataSource(widgetType.compatibleDataSources[0]);
    }
    setStep("configure");
  };

  const handleBack = () => {
    setStep("select-type");
    setSelectedType(null);
    setTitle("");
    setDataSource("");
  };

  const handleAdd = () => {
    if (!selectedType || !title || !dataSource) return;

    onSelectWidget({
      widget_type: selectedType.type,
      title,
      data_source: dataSource as WidgetDataSource,
      config: {},
      width: selectedType.defaultWidth,
      height: selectedType.defaultHeight,
      position_x: 0,
      position_y: 0,
    });

    // Reset state
    setStep("select-type");
    setSelectedType(null);
    setTitle("");
    setDataSource("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {step === "select-type" && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Widget Type Grid */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-2">
              {filteredTypes.map((widgetType) => (
                <button
                  key={widgetType.type}
                  onClick={() => handleSelectType(widgetType)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-lg border text-left",
                    "transition-colors hover:bg-accent hover:border-accent-foreground/20",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-primary">{widgetType.icon}</div>
                    <span className="font-medium text-sm">{widgetType.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {widgetType.description}
                  </span>
                </button>
              ))}
            </div>

            {filteredTypes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No widgets match your search</p>
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {step === "configure" && selectedType && (
        <div className="space-y-4">
          {/* Selected Widget Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="text-primary">{selectedType.icon}</div>
            <div>
              <p className="font-medium text-sm">{selectedType.label}</p>
              <p className="text-xs text-muted-foreground">
                {selectedType.description}
              </p>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title..."
            />
          </div>

          {/* Data Source Select */}
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
                {compatibleDataSources.map((ds) => (
                  <SelectItem key={ds.source} value={ds.source}>
                    <div className="flex flex-col">
                      <span>{ds.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {DATA_SOURCES.find((ds) => ds.source === dataSource)?.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!title || !dataSource}
              className="flex-1"
            >
              Add Widget
            </Button>
          </div>
        </div>
      )}

      {/* Close Button (always visible) */}
      {onClose && step === "select-type" && (
        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
          Cancel
        </Button>
      )}
    </div>
  );
}
