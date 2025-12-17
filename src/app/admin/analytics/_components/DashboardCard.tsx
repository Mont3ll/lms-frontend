"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Star,
  Share2,
  Clock,
  Grid3X3,
  User,
} from "lucide-react";
import type { DashboardListItem } from "@/lib/types";

interface DashboardCardProps {
  dashboard: DashboardListItem;
  onView?: (dashboard: DashboardListItem) => void;
  onEdit?: (dashboard: DashboardListItem) => void;
  onClone?: (dashboard: DashboardListItem) => void;
  onDelete?: (dashboard: DashboardListItem) => void;
  onSetDefault?: (dashboard: DashboardListItem) => void;
  onToggleShare?: (dashboard: DashboardListItem) => void;
}

export function DashboardCard({
  dashboard,
  onView,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
  onToggleShare,
}: DashboardCardProps) {
  const formattedDate = new Date(dashboard.updated_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const timeRangeLabels: Record<string, string> = {
    "7d": "7 Days",
    "30d": "30 Days",
    "90d": "90 Days",
    "1y": "1 Year",
    all: "All Time",
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold truncate">
              {dashboard.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {dashboard.is_default && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <Star className="h-3 w-3 mr-0.5" />
                Default
              </Badge>
            )}
            {dashboard.is_shared && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                <Share2 className="h-3 w-3 mr-0.5" />
                Shared
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(dashboard)}>
                  <Eye className="h-4 w-4" />
                  View Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(dashboard)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onClone?.(dashboard)}>
                  <Copy className="h-4 w-4" />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onSetDefault?.(dashboard)}
                  disabled={dashboard.is_default}
                >
                  <Star className="h-4 w-4" />
                  {dashboard.is_default ? "Is Default" : "Set as Default"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleShare?.(dashboard)}>
                  <Share2 className="h-4 w-4" />
                  {dashboard.is_shared ? "Make Private" : "Share"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete?.(dashboard)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {dashboard.description && (
          <CardDescription className="line-clamp-2 mt-1.5">
            {dashboard.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>
              {dashboard.widget_count}{" "}
              {dashboard.widget_count === 1 ? "widget" : "widgets"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {timeRangeLabels[dashboard.default_time_range] ||
                dashboard.default_time_range}
            </span>
          </div>
          {dashboard.owner_name && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{dashboard.owner_name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Updated {formattedDate}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(dashboard)}
          className="gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
