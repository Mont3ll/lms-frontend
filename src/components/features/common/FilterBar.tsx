"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

export interface ActiveFilters {
  search: string;
  [key: string]: string;
}

interface FilterBarProps {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Current search value */
  searchValue: string;
  /** Callback when search value changes */
  onSearchChange: (value: string) => void;
  /** Array of filter configurations */
  filters?: FilterConfig[];
  /** Current active filter values (keyed by filter id) */
  activeFilters?: Record<string, string>;
  /** Callback when a filter value changes */
  onFilterChange?: (filterId: string, value: string) => void;
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Additional className for the container */
  className?: string;
  /** Show result count */
  resultCount?: number;
  /** Label for result count */
  resultLabel?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  className,
  resultCount,
  resultLabel = "results",
}: FilterBarProps) {
  // Check if any filters are active
  const hasActiveFilters =
    searchValue.trim() !== "" ||
    Object.values(activeFilters).some((v) => v && v !== "all");

  // Get active filter badges
  const getActiveFilterBadges = () => {
    const badges: { id: string; label: string; value: string }[] = [];

    if (searchValue.trim()) {
      badges.push({
        id: "search",
        label: "Search",
        value: searchValue,
      });
    }

    filters.forEach((filter) => {
      const value = activeFilters[filter.id];
      if (value && value !== "all") {
        const option = filter.options.find((o) => o.value === value);
        badges.push({
          id: filter.id,
          label: filter.label,
          value: option?.label || value,
        });
      }
    });

    return badges;
  };

  const activeBadges = getActiveFilterBadges();

  const handleClearFilter = (filterId: string) => {
    if (filterId === "search") {
      onSearchChange("");
    } else {
      onFilterChange?.(filterId, "all");
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            {filters.map((filter) => (
              <Select
                key={filter.id}
                value={activeFilters[filter.id] || "all"}
                onValueChange={(value) => onFilterChange?.(filter.id, value)}
              >
                <SelectTrigger className="w-[140px] h-9" size="sm">
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Active filters and result count row */}
      {(hasActiveFilters || resultCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Active filter badges */}
          {activeBadges.map((badge) => (
            <Badge
              key={badge.id}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              <span className="text-muted-foreground">{badge.label}:</span>
              <span className="max-w-[100px] truncate">{badge.value}</span>
              <button
                onClick={() => handleClearFilter(badge.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Clear all button */}
          {hasActiveFilters && activeBadges.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          )}

          {/* Result count */}
          {resultCount !== undefined && (
            <span className="text-sm text-muted-foreground ml-auto">
              {resultCount} {resultCount === 1 ? resultLabel.replace(/s$/, "") : resultLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage filter state for the FilterBar component
 */
export function useFilterState(initialFilters: Record<string, string> = {}) {
  const [searchValue, setSearchValue] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>(initialFilters);

  const handleFilterChange = React.useCallback((filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  }, []);

  const handleClearAll = React.useCallback(() => {
    setSearchValue("");
    setActiveFilters(
      Object.keys(activeFilters).reduce(
        (acc, key) => ({ ...acc, [key]: "all" }),
        {}
      )
    );
  }, [activeFilters]);

  return {
    searchValue,
    setSearchValue,
    activeFilters,
    setActiveFilters,
    handleFilterChange,
    handleClearAll,
  };
}
