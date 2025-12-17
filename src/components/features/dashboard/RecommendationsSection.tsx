"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchLearnerRecommendations,
  type ContentRecommendation,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Sparkles,
  BookOpen,
  Route,
  Users,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

interface RecommendationCardProps {
  recommendation: ContentRecommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  const isCourse = recommendation.type === "course";
  const href = isCourse
    ? `/learner/courses/${recommendation.slug}`
    : `/learner/learning-paths/${recommendation.slug}`;

  return (
    <Card className="flex flex-col h-full hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant={isCourse ? "default" : "secondary"}
            className="text-xs shrink-0"
          >
            {isCourse ? (
              <>
                <BookOpen className="h-3 w-3 mr-1" />
                Course
              </>
            ) : (
              <>
                <Route className="h-3 w-3 mr-1" />
                Learning Path
              </>
            )}
          </Badge>
          {recommendation.category && (
            <Badge variant="outline" className="text-xs">
              {recommendation.category}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base mt-2 line-clamp-2">
          <Link href={href} className="hover:text-primary">
            {recommendation.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <CardDescription className="line-clamp-2 text-sm mb-3">
          {recommendation.description || "No description available."}
        </CardDescription>

        {/* Reason for recommendation */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
          <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-yellow-500" />
          <span className="line-clamp-2">{recommendation.reason}</span>
        </div>

        {/* Enrollment count if available */}
        {recommendation.enrollment_count !== undefined &&
          recommendation.enrollment_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Users className="h-3 w-3" />
              <span>
                {recommendation.enrollment_count.toLocaleString()} enrolled
              </span>
            </div>
          )}
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={href}>
            {isCourse ? "View Course" : "View Path"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

const RecommendationCardSkeleton: React.FC = () => (
  <Card className="flex flex-col h-full">
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-full mt-2" />
      <Skeleton className="h-5 w-3/4" />
    </CardHeader>
    <CardContent className="flex-grow pb-2">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-12 w-full rounded-md" />
    </CardContent>
    <div className="p-4 pt-0">
      <Skeleton className="h-9 w-full" />
    </div>
  </Card>
);

interface RecommendationsSectionProps {
  limit?: number;
  excludeEnrolled?: boolean;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  limit = 6,
  excludeEnrolled = true,
}) => {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...QUERY_KEYS.LEARNER_RECOMMENDATIONS, limit, excludeEnrolled],
    queryFn: () =>
      fetchLearnerRecommendations({
        limit,
        exclude_enrolled: excludeEnrolled,
      }),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  // Don't render anything if there are no recommendations and not loading
  if (!isLoading && !isError && (!data || data.recommendations.length === 0)) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learner/courses">
            Browse All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <RecommendationCardSkeleton key={index} />
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to load recommendations at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && data.recommendations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.recommendations.map((recommendation) => (
            <RecommendationCard
              key={`${recommendation.type}-${recommendation.id}`}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
