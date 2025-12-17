"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  fetchPersonalizedPaths,
  fetchPersonalizedPathProgress,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  Target,
  Sparkles,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  Archive,
  AlertCircle,
  ChevronRight,
  Zap,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { FilterBar, useFilterState, type FilterConfig } from "@/components/features/common/FilterBar";
import type {
  PersonalizedLearningPathListItem,
  PersonalizedPathProgress,
  PersonalizedPathGenerationType,
  PersonalizedPathStatus,
} from "@/lib/types";

// =============================================================================
// Constants
// =============================================================================

const STATUS_FILTER_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Archived", value: "ARCHIVED" },
];

const TYPE_FILTER_OPTIONS = [
  { label: "Skill Gap", value: "SKILL_GAP" },
  { label: "Remedial", value: "REMEDIAL" },
  { label: "Goal Based", value: "GOAL_BASED" },
  { label: "Onboarding", value: "ONBOARDING" },
];

/** Generation type configuration */
const GENERATION_TYPE_CONFIG: Record<
  PersonalizedPathGenerationType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  SKILL_GAP: {
    label: "Skill Gap",
    icon: <Target className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  REMEDIAL: {
    label: "Remedial",
    icon: <BookOpen className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  GOAL_BASED: {
    label: "Goal Based",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  ONBOARDING: {
    label: "Onboarding",
    icon: <ChevronRight className="h-4 w-4" />,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
};

/** Status configuration */
const STATUS_CONFIG: Record<
  PersonalizedPathStatus,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  ACTIVE: {
    label: "Active",
    icon: <Sparkles className="h-3 w-3" />,
    variant: "default",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle className="h-3 w-3" />,
    variant: "secondary",
  },
  EXPIRED: {
    label: "Expired",
    icon: <AlertCircle className="h-3 w-3" />,
    variant: "destructive",
  },
  ARCHIVED: {
    label: "Archived",
    icon: <Archive className="h-3 w-3" />,
    variant: "outline",
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/** Format duration in hours to readable string */
const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hr${hours >= 2 ? "s" : ""}`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
};

/** Format relative date */
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Expired";
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  if (diffDays <= 7) {
    return `${diffDays} days`;
  }
  return date.toLocaleDateString();
};

// =============================================================================
// Sub-components
// =============================================================================

/** Skeleton for path card */
const PathCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-2 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

/** Stats card component */
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, icon, description }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

/** Personalized path card */
const PersonalizedPathCard: React.FC<{
  path: PersonalizedLearningPathListItem;
  progress?: PersonalizedPathProgress;
}> = ({ path, progress }) => {
  const generationConfig = GENERATION_TYPE_CONFIG[path.generation_type];
  const statusConfig = STATUS_CONFIG[path.status];
  const progressPercentage = progress?.progress_percentage ?? 0;
  const isInProgress = progress && progress.status === "IN_PROGRESS";
  const isCompleted = path.status === "COMPLETED" || progress?.status === "COMPLETED";

  // Determine action text
  const getActionText = () => {
    if (isCompleted) return "Review";
    if (isInProgress) return "Continue";
    return "Start";
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full transition-all hover:shadow-md",
        path.is_expired && "opacity-75"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{path.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {path.description}
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant} className="shrink-0">
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>

        {/* Generation type badge */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={cn("text-xs", generationConfig.color)}>
            <span className="flex items-center gap-1">
              {generationConfig.icon}
              {generationConfig.label}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* Progress Section (if user has started) */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progress.current_step_info && (
              <p className="text-xs text-muted-foreground">
                Current: {progress.current_step_info.module_title}
              </p>
            )}
          </div>
        )}

        {/* Path metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(path.estimated_duration)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {path.total_steps} step{path.total_steps !== 1 ? "s" : ""}
          </span>
          {path.expires_at && !path.is_expired && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Expires {formatRelativeDate(path.expires_at)}
            </span>
          )}
        </div>

        {/* Expired warning */}
        {path.is_expired && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            This path has expired
          </div>
        )}
      </CardContent>

      {/* Footer with action button */}
      <div className="p-6 pt-0 mt-auto">
        <Button
          asChild
          className="w-full"
          variant={isCompleted ? "outline" : "default"}
          disabled={path.is_expired && !isCompleted}
        >
          <Link href={`/learner/learning-paths/personalized/${path.id}`}>
            {getActionText()}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

/** Empty state component */
const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}> = ({ title, description, actionLabel, actionHref }) => (
  <Card>
    <CardContent className="py-12 text-center">
      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

// =============================================================================
// Main Component
// =============================================================================

export default function PersonalizedPathsPage() {
  // Use the filter state hook
  const {
    searchValue,
    setSearchValue,
    activeFilters,
    handleFilterChange,
    handleClearAll,
  } = useFilterState({ status: "all", type: "all" });

  // Fetch personalized paths
  const {
    data: pathsData,
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useQuery({
    queryKey: [...QUERY_KEYS.PERSONALIZED_PATHS],
    queryFn: () => fetchPersonalizedPaths(),
  });

  // Fetch progress for all paths
  const {
    data: progressData,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ["personalizedPathProgress"],
    queryFn: () => fetchPersonalizedPathProgress(),
  });

  const isLoading = isLoadingPaths || isLoadingProgress;

  // Create progress map
  const progressMap = useMemo(() => {
    const map = new Map<string, PersonalizedPathProgress>();
    progressData?.results?.forEach((progress: PersonalizedPathProgress) => {
      map.set(progress.path, progress);
    });
    return map;
  }, [progressData?.results]);

  // Compute stats
  const stats = useMemo(() => {
    const paths = pathsData?.results || [];
    const activePaths = paths.filter((p) => p.status === "ACTIVE");
    const completedPaths = paths.filter((p) => p.status === "COMPLETED");
    const inProgressPaths = Array.from(progressMap.values()).filter(
      (p) => p.status === "IN_PROGRESS"
    );

    // Calculate total learning time
    const totalHours = paths.reduce((sum, p) => sum + p.estimated_duration, 0);

    return {
      total: paths.length,
      active: activePaths.length,
      completed: completedPaths.length,
      inProgress: inProgressPaths.length,
      totalHours,
    };
  }, [pathsData?.results, progressMap]);

  // Build filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => {
    return [
      {
        id: "status",
        label: "Status",
        options: STATUS_FILTER_OPTIONS,
        placeholder: "Filter by status",
      },
      {
        id: "type",
        label: "Type",
        options: TYPE_FILTER_OPTIONS,
        placeholder: "Filter by type",
      },
    ];
  }, []);

  // Filter paths
  const filteredPaths = useMemo(() => {
    const paths = pathsData?.results || [];

    return paths.filter((path) => {
      // Search filter
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        const matchesTitle = path.title.toLowerCase().includes(searchLower);
        const matchesDescription = path.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Status filter
      if (activeFilters.status && activeFilters.status !== "all") {
        if (path.status !== activeFilters.status) {
          return false;
        }
      }

      // Type filter
      if (activeFilters.type && activeFilters.type !== "all") {
        if (path.generation_type !== activeFilters.type) {
          return false;
        }
      }

      return true;
    });
  }, [pathsData?.results, searchValue, activeFilters]);

  // Group paths by status for tabs
  const pathsByTab = useMemo(() => {
    return {
      all: filteredPaths,
      active: filteredPaths.filter((p) => p.status === "ACTIVE"),
      completed: filteredPaths.filter((p) => p.status === "COMPLETED"),
      archived: filteredPaths.filter((p) => p.status === "ARCHIVED" || p.status === "EXPIRED"),
    };
  }, [filteredPaths]);

  if (pathsError) {
    return (
      <PageWrapper
        title="My Personalized Paths"
        description="View and manage your AI-generated personalized learning paths."
      >
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Paths</AlertTitle>
          <AlertDescription>
            Failed to load personalized learning paths. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Personalized Paths"
      description="View and manage your AI-generated personalized learning paths."
    >
      <div className="space-y-6">
        {/* Header with Generate button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <p className="text-muted-foreground">
              Personalized paths tailored to your learning goals and skill gaps.
            </p>
          </div>
          <Button asChild>
            <Link href="/learner/learning-paths/generate">
              <Zap className="mr-2 h-4 w-4" />
              Generate New Path
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        {!isLoading && stats.total > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Paths"
              value={stats.total}
              icon={<Target className="h-6 w-6" />}
              description={`${formatDuration(stats.totalHours)} total`}
            />
            <StatsCard
              title="Active"
              value={stats.active}
              icon={<Sparkles className="h-6 w-6" />}
              description="Ready to learn"
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgress}
              icon={<TrendingUp className="h-6 w-6" />}
              description="Currently learning"
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircle className="h-6 w-6" />}
              description="Finished paths"
            />
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PathCardSkeleton key={i} />
            ))}
          </div>
        ) : stats.total === 0 ? (
          <EmptyState
            title="No Personalized Paths Yet"
            description="Generate your first personalized learning path based on your skill gaps or assessment results."
            actionLabel="Generate Path"
            actionHref="/learner/learning-paths/generate"
          />
        ) : (
          <div className="space-y-4">
            {/* Filter Bar */}
            <FilterBar
              searchPlaceholder="Search paths..."
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              filters={filterConfigs}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              resultCount={filteredPaths.length}
              resultLabel="paths"
            />

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {pathsByTab.all.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  {pathsByTab.active.length > 0 && (
                    <Badge variant="default" className="ml-2 text-xs">
                      {pathsByTab.active.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  {pathsByTab.completed.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {pathsByTab.completed.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived">
                  Archived
                  {pathsByTab.archived.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {pathsByTab.archived.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* All Paths Tab */}
              <TabsContent value="all" className="mt-4">
                {pathsByTab.all.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground">
                      No paths match your filters.
                    </p>
                    <Button variant="link" onClick={handleClearAll} className="mt-2">
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pathsByTab.all.map((path) => (
                      <PersonalizedPathCard
                        key={path.id}
                        path={path}
                        progress={progressMap.get(path.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Active Paths Tab */}
              <TabsContent value="active" className="mt-4">
                {pathsByTab.active.length === 0 ? (
                  <EmptyState
                    title="No Active Paths"
                    description="You don't have any active personalized paths. Generate a new one to get started!"
                    actionLabel="Generate Path"
                    actionHref="/learner/learning-paths/generate"
                  />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pathsByTab.active.map((path) => (
                      <PersonalizedPathCard
                        key={path.id}
                        path={path}
                        progress={progressMap.get(path.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Completed Paths Tab */}
              <TabsContent value="completed" className="mt-4">
                {pathsByTab.completed.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Completed Paths</h3>
                      <p className="text-muted-foreground">
                        Complete your active paths to see them here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pathsByTab.completed.map((path) => (
                      <PersonalizedPathCard
                        key={path.id}
                        path={path}
                        progress={progressMap.get(path.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Archived Paths Tab */}
              <TabsContent value="archived" className="mt-4">
                {pathsByTab.archived.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Archived Paths</h3>
                      <p className="text-muted-foreground">
                        Archived and expired paths will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pathsByTab.archived.map((path) => (
                      <PersonalizedPathCard
                        key={path.id}
                        path={path}
                        progress={progressMap.get(path.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* CTA for generating new path */}
        {!isLoading && stats.total > 0 && stats.active === 0 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Ready for More Learning?
                  </h3>
                  <p className="text-muted-foreground">
                    Generate a new personalized learning path to continue your growth.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/learner/learning-paths/generate">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate New Path
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
