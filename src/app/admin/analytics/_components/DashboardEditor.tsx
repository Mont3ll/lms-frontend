"use client";

import React, { useState, useCallback } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Eye } from "lucide-react";
import Link from "next/link";
import type {
  DashboardDetail,
  DashboardCreateData,
  DashboardUpdateData,
  WidgetCreateData,
  DashboardTimeRange,
} from "@/lib/types";
import { WidgetPalette } from "./WidgetPalette";
import { DashboardGrid } from "./DashboardGrid";
import { WidgetConfigModal } from "./WidgetConfigModal";

const dashboardSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional().nullable(),
  is_shared: z.boolean(),
  default_time_range: z.enum(["7d", "30d", "90d", "1y", "all", "custom"]),
  refresh_interval: z.coerce.number().min(0).max(3600),
});

type DashboardFormValues = z.infer<typeof dashboardSchema>;

/** Temporary widget for editor state (before saving) */
export interface EditorWidget extends Omit<WidgetCreateData, "order"> {
  /** Temporary ID for unsaved widgets, or real ID for existing widgets */
  tempId: string;
  /** Original database ID (if editing existing widget) */
  id?: string;
}

interface DashboardEditorProps {
  /** Existing dashboard data when editing */
  dashboard?: DashboardDetail;
  /** Whether we're editing an existing dashboard vs creating new */
  isEditing?: boolean;
  /** Callback when save is triggered */
  onSave: (data: DashboardCreateData | DashboardUpdateData) => Promise<void>;
  /** Whether save is in progress */
  isSaving?: boolean;
}

const TIME_RANGE_OPTIONS: { value: DashboardTimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

const REFRESH_INTERVAL_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
];

export function DashboardEditor({
  dashboard,
  isEditing = false,
  onSave,
  isSaving = false,
}: DashboardEditorProps) {
  // Convert existing widgets to editor format
  const initialWidgets: EditorWidget[] = dashboard?.widgets?.map((w) => ({
    tempId: w.id,
    id: w.id,
    widget_type: w.widget_type,
    title: w.title,
    data_source: w.data_source,
    config: w.config,
    position_x: w.position_x,
    position_y: w.position_y,
    width: w.width,
    height: w.height,
  })) ?? [];

  // Widget state
  const [widgets, setWidgets] = useState<EditorWidget[]>(initialWidgets);
  const [selectedWidget, setSelectedWidget] = useState<EditorWidget | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Form setup
  const form = useForm<DashboardFormValues>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: dashboard?.name ?? "",
      description: dashboard?.description ?? "",
      is_shared: dashboard?.is_shared ?? false,
      default_time_range: dashboard?.default_time_range ?? "30d",
      refresh_interval: dashboard?.refresh_interval ?? 0,
    },
  });

  // Add widget from palette
  const handleAddWidget = useCallback((widgetData: Omit<WidgetCreateData, "order">) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWidget: EditorWidget = {
      tempId,
      ...widgetData,
      position_x: widgetData.position_x ?? 0,
      position_y: widgetData.position_y ?? Infinity, // Will be placed at bottom
      width: widgetData.width ?? 4,
      height: widgetData.height ?? 3,
    };
    setWidgets((prev) => [...prev, newWidget]);
    setIsPaletteOpen(false);
    toast.success(`Added "${widgetData.title}" widget`);
  }, []);

  // Update widget positions from grid
  const handleLayoutChange = useCallback(
    (layout: { i: string; x: number; y: number; w: number; h: number }[]) => {
      setWidgets((prev) =>
        prev.map((widget) => {
          const layoutItem = layout.find((l) => l.i === widget.tempId);
          if (layoutItem) {
            return {
              ...widget,
              position_x: layoutItem.x,
              position_y: layoutItem.y,
              width: layoutItem.w,
              height: layoutItem.h,
            };
          }
          return widget;
        })
      );
    },
    []
  );

  // Edit widget
  const handleEditWidget = useCallback((widget: EditorWidget) => {
    setSelectedWidget(widget);
    setIsWidgetModalOpen(true);
  }, []);

  // Update widget after editing
  const handleUpdateWidget = useCallback((updated: EditorWidget) => {
    setWidgets((prev) =>
      prev.map((w) => (w.tempId === updated.tempId ? updated : w))
    );
    setIsWidgetModalOpen(false);
    setSelectedWidget(null);
    toast.success(`Updated "${updated.title}" widget`);
  }, []);

  // Delete widget
  const handleDeleteWidget = useCallback((tempId: string) => {
    setWidgets((prev) => prev.filter((w) => w.tempId !== tempId));
    toast.success("Widget removed");
  }, []);

  // Handle form submission
  const handleSubmit = async (formData: DashboardFormValues) => {
    // Convert widgets to create data with order
    const widgetCreateData: WidgetCreateData[] = widgets.map((w, index) => ({
      widget_type: w.widget_type,
      title: w.title,
      data_source: w.data_source,
      config: w.config,
      position_x: w.position_x ?? 0,
      position_y: w.position_y ?? 0,
      width: w.width ?? 4,
      height: w.height ?? 3,
      order: index,
    }));

    const dashboardData: DashboardCreateData | DashboardUpdateData = {
      name: formData.name,
      description: formData.description || null,
      is_shared: formData.is_shared,
      default_time_range: formData.default_time_range,
      refresh_interval: formData.refresh_interval,
      widgets: widgetCreateData,
    };

    try {
      await onSave(dashboardData);
    } catch {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {isEditing ? `Edit: ${dashboard?.name}` : "Create Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Modify your dashboard layout and widgets"
                : "Design a new custom analytics dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && dashboard?.id && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/analytics/dashboards/${dashboard.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Dashboard"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar - Settings & Widget Palette */}
        <div className="w-80 flex-shrink-0 overflow-y-auto space-y-4">
          {/* Dashboard Settings Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dashboard Settings</CardTitle>
              <CardDescription>Configure your dashboard properties</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Dashboard" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this dashboard shows..."
                            rows={2}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="default_time_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Time Range</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_RANGE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="refresh_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Refresh</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select refresh interval" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REFRESH_INTERVAL_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_shared"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Share Dashboard</FormLabel>
                          <FormDescription className="text-xs">
                            Allow other admins to view this dashboard
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Add Widget Button / Palette Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Widgets</CardTitle>
                <Button
                  size="sm"
                  variant={isPaletteOpen ? "secondary" : "default"}
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Widget
                </Button>
              </div>
              <CardDescription>
                {widgets.length} widget{widgets.length !== 1 ? "s" : ""} added
              </CardDescription>
            </CardHeader>
            {isPaletteOpen && (
              <CardContent className="pt-0">
                <WidgetPalette
                  onSelectWidget={handleAddWidget}
                  onClose={() => setIsPaletteOpen(false)}
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Content - Grid */}
        <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-4">
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-1">No widgets yet</h3>
              <p className="text-sm max-w-sm">
                Click &ldquo;Add Widget&rdquo; to start building your dashboard with
                charts, stats, and tables.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsPaletteOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          ) : (
            <DashboardGrid
              widgets={widgets}
              onLayoutChange={handleLayoutChange}
              onEditWidget={handleEditWidget}
              onDeleteWidget={handleDeleteWidget}
              isEditing={true}
            />
          )}
        </div>
      </div>

      {/* Widget Config Modal */}
      <WidgetConfigModal
        open={isWidgetModalOpen}
        onOpenChange={setIsWidgetModalOpen}
        widget={selectedWidget}
        onSave={handleUpdateWidget}
      />
    </div>
  );
}
