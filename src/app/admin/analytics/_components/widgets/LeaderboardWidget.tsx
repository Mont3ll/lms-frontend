"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

interface LeaderboardEntry {
  id: string | number;
  name: string;
  value: number;
  avatar?: string;
  subtitle?: string;
  change?: number;
}

interface LeaderboardWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * A leaderboard widget for displaying ranked lists.
 */
export function LeaderboardWidget({ data, config, className }: LeaderboardWidgetProps) {
  const leaderboardData = data as LeaderboardEntry[] | undefined;

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  const limit = config.limit || 10;
  const showRank = config.showRank !== false;
  const displayData = leaderboardData.slice(0, limit);

  // Get rank badge color
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-yellow-950";
      case 2:
        return "bg-slate-400 text-slate-950";
      case 3:
        return "bg-amber-600 text-amber-950";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format value for display
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: value >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {displayData.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              {/* Rank badge */}
              {showRank && (
                <div
                  className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                    getRankColor(index + 1)
                  )}
                >
                  {index + 1}
                </div>
              )}

              {/* Avatar */}
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(entry.name)}
                </AvatarFallback>
              </Avatar>

              {/* Name and subtitle */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                {entry.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.subtitle}
                  </p>
                )}
              </div>

              {/* Value and change */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold">{formatValue(entry.value)}</p>
                {entry.change !== undefined && (
                  <Badge
                    variant={entry.change >= 0 ? "default" : "destructive"}
                    className="text-xs px-1.5"
                  >
                    {entry.change >= 0 ? "+" : ""}
                    {entry.change}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardWidget;
