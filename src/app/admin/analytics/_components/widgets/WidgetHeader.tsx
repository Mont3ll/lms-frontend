"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical,
  Settings,
  RefreshCw,
  Trash2,
  Copy,
  Maximize2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps {
  /** Widget title */
  title: string;
  /** Whether the widget is in edit mode (shows edit controls) */
  isEditMode?: boolean;
  /** Whether data is currently being refreshed */
  isRefreshing?: boolean;
  /** Callback when configure button is clicked */
  onConfigure?: () => void;
  /** Callback when refresh button is clicked */
  onRefresh?: () => void;
  /** Callback when delete button is clicked */
  onDelete?: () => void;
  /** Callback when duplicate button is clicked */
  onDuplicate?: () => void;
  /** Callback when fullscreen button is clicked */
  onFullscreen?: () => void;
  /** Callback when export button is clicked */
  onExport?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Last updated timestamp */
  lastUpdated?: string;
}

/**
 * Header component for widgets with title and action menu.
 */
export function WidgetHeader({
  title,
  isEditMode = false,
  isRefreshing = false,
  onConfigure,
  onRefresh,
  onDelete,
  onDuplicate,
  onFullscreen,
  onExport,
  className,
  lastUpdated,
}: WidgetHeaderProps) {
  const hasActions = onConfigure || onRefresh || onDelete || onDuplicate || onFullscreen || onExport;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b bg-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <h3 className="font-medium text-sm truncate">{title}</h3>
        {lastUpdated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                •
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {hasActions && (
        <div className="flex items-center gap-1">
          {/* Quick refresh button */}
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
                  />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isEditMode && onConfigure && (
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
              )}

              {onFullscreen && (
                <DropdownMenuItem onClick={onFullscreen}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Full screen
                </DropdownMenuItem>
              )}

              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              )}

              {isEditMode && onDuplicate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                </>
              )}

              {isEditMode && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export default WidgetHeader;
