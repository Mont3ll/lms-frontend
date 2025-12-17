"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Archive,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PersonalizedLearningPath,
  PersonalizedLearningPathListItem,
  PersonalizedPathProgress,
  PersonalizedPathGenerationType,
  PersonalizedPathStatus,
} from "@/lib/types";

/** Props for PersonalizedPathCard */
interface PersonalizedPathCardProps {
  /** The personalized path data (can be full or list item) */
  path: PersonalizedLearningPath | PersonalizedLearningPathListItem;
  /** Optional progress information */
  progress?: PersonalizedPathProgress;
  /** Callback when card is clicked */
  onClick?: () => void;
  /** Callback for primary action (Start/Continue/View) */
  onAction?: (pathId: string) => void;
  /** Show compact version without footer */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

/** Generation type configuration */
const GENERATION_TYPE_CONFIG: Record<
  PersonalizedPathGenerationType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  SKILL_GAP: {
    label: "Skill Gap",
    icon: <Target className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  REMEDIAL: {
    label: "Remedial",
    icon: <BookOpen className="h-3 w-3" />,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  GOAL_BASED: {
    label: "Goal Based",
    icon: <Sparkles className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  ONBOARDING: {
    label: "Onboarding",
    icon: <ChevronRight className="h-3 w-3" />,
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

/** Format date relative to now */
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

/**
 * PersonalizedPathCard - Displays a personalized learning path with progress.
 *
 * Shows generation type, target skills, progress, and status information.
 * Supports both detailed and compact views.
 */
export const PersonalizedPathCard: React.FC<PersonalizedPathCardProps> = ({
  path,
  progress,
  onClick,
  onAction,
  compact = false,
  className,
}) => {
  const generationConfig = GENERATION_TYPE_CONFIG[path.generation_type];
  const statusConfig = STATUS_CONFIG[path.status];
  const progressPercentage = progress?.progress_percentage ?? 0;
  const isInProgress = progress && progress.status === "IN_PROGRESS";
  const isCompleted = path.status === "COMPLETED" || progress?.status === "COMPLETED";

  // Check if path has target skills info (full path only)
  const hasTargetSkills =
    "target_skills_info" in path && path.target_skills_info.length > 0;

  // Get action button text
  const getActionText = () => {
    if (isCompleted) return "Review";
    if (isInProgress) return "Continue";
    return "Start";
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(path.id);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col h-full transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md",
        path.is_expired && "opacity-75",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">
              {path.title}
            </CardTitle>
            {!compact && (
              <CardDescription className="line-clamp-2 mt-1">
                {path.description}
              </CardDescription>
            )}
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

      <CardContent className={cn("flex-grow", compact ? "pt-0" : "space-y-4")}>
        {/* Progress Section (if user has started) */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progress.current_step_info && !compact && (
              <p className="text-xs text-muted-foreground">
                Current: {progress.current_step_info.module_title}
              </p>
            )}
          </div>
        )}

        {/* Path metadata */}
        <div className={cn("flex flex-wrap items-center gap-3 text-sm text-muted-foreground", compact && "mt-2")}>
          {/* Duration */}
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(path.estimated_duration)}
          </span>

          {/* Steps count */}
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {path.total_steps} step{path.total_steps !== 1 ? "s" : ""}
          </span>

          {/* Expiration (if applicable) */}
          {path.expires_at && !path.is_expired && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Calendar className="h-4 w-4" />
              Expires {formatRelativeDate(path.expires_at)}
            </span>
          )}
        </div>

        {/* Target skills (non-compact only) */}
        {!compact && hasTargetSkills && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Target Skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {(path as PersonalizedLearningPath).target_skills_info.slice(0, 5).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {(path as PersonalizedLearningPath).target_skills_info.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{(path as PersonalizedLearningPath).target_skills_info.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expired warning */}
        {path.is_expired && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            This path has expired
          </div>
        )}
      </CardContent>

      {/* Footer with action button (non-compact only) */}
      {!compact && (
        <CardFooter className="pt-0">
          {onAction ? (
            <Button
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
              onClick={handleAction}
              disabled={path.is_expired && !isCompleted}
            >
              {getActionText()}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="w-full" variant={isCompleted ? "outline" : "default"}>
              <Link href={`/learner/personalized-paths/${path.id}`}>
                {getActionText()}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

/** Props for PersonalizedPathList */
interface PersonalizedPathListProps {
  /** List of personalized paths */
  paths: (PersonalizedLearningPath | PersonalizedLearningPathListItem)[];
  /** Map of path ID to progress */
  progressMap?: Map<string, PersonalizedPathProgress>;
  /** Callback when a path is clicked */
  onPathClick?: (path: PersonalizedLearningPath | PersonalizedLearningPathListItem) => void;
  /** Callback for path action */
  onPathAction?: (pathId: string) => void;
  /** Show compact cards */
  compact?: boolean;
  /** Max number of paths to display */
  maxDisplay?: number;
  /** Show view all button */
  showViewAll?: boolean;
  /** Callback for view all */
  onViewAll?: () => void;
  /** Grid columns (responsive) */
  columns?: 1 | 2 | 3;
  /** Additional class names */
  className?: string;
}

/**
 * PersonalizedPathList - Displays a grid/list of personalized learning paths.
 */
export const PersonalizedPathList: React.FC<PersonalizedPathListProps> = ({
  paths,
  progressMap,
  onPathClick,
  onPathAction,
  compact = false,
  maxDisplay,
  showViewAll = false,
  onViewAll,
  columns = 2,
  className,
}) => {
  const displayedPaths = maxDisplay ? paths.slice(0, maxDisplay) : paths;
  const remainingCount = maxDisplay ? Math.max(0, paths.length - maxDisplay) : 0;

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  }[columns];

  if (paths.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No personalized paths available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("grid gap-4", gridClass)}>
        {displayedPaths.map((path) => (
          <PersonalizedPathCard
            key={path.id}
            path={path}
            progress={progressMap?.get(path.id)}
            onClick={onPathClick ? () => onPathClick(path) : undefined}
            onAction={onPathAction}
            compact={compact}
          />
        ))}
      </div>
      {showViewAll && remainingCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          View {remainingCount} more path{remainingCount !== 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
};

/** Props for PersonalizedPathSummary (compact inline display) */
interface PersonalizedPathSummaryProps {
  /** Path data */
  path: PersonalizedLearningPath | PersonalizedLearningPathListItem;
  /** Progress data */
  progress?: PersonalizedPathProgress;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * PersonalizedPathSummary - Compact inline display for a path (e.g., in a list).
 */
export const PersonalizedPathSummary: React.FC<PersonalizedPathSummaryProps> = ({
  path,
  progress,
  onClick,
  className,
}) => {
  const generationConfig = GENERATION_TYPE_CONFIG[path.generation_type];
  const statusConfig = STATUS_CONFIG[path.status];
  const progressPercentage = progress?.progress_percentage ?? 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50",
        path.is_expired && "opacity-75",
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
          generationConfig.color
        )}
      >
        {generationConfig.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{path.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{path.total_steps} steps</span>
          <span>•</span>
          <span>{formatDuration(path.estimated_duration)}</span>
        </div>
      </div>

      {/* Progress or Status */}
      <div className="shrink-0 text-right">
        {progress ? (
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* Arrow */}
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  );
};

export default PersonalizedPathCard;
