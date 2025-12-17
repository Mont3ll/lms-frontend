"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

import {
  fetchRemedialRecommendations,
  getApiErrorMessage,
  type RemedialRecommendation,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RemedialRecommendationsProps {
  /** Optional attempt ID to get recommendations for a specific attempt */
  attemptId?: string;
  /** Maximum number of recommendations to display */
  limit?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RemedialRecommendations Component
 *
 * Displays personalized content recommendations for learners who need
 * to review material based on their assessment performance.
 */
export function RemedialRecommendations({
  attemptId,
  limit = 5,
  className,
}: RemedialRecommendationsProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["remedialRecommendations", attemptId, limit],
    queryFn: () => fetchRemedialRecommendations({ attemptId, limit }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get priority badge variant
  const getPriorityBadge = (priority: RemedialRecommendation["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Get content type icon/label
  const getContentTypeLabel = (contentType: string) => {
    const types: Record<string, string> = {
      TEXT: "Reading",
      DOCUMENT: "Document",
      VIDEO: "Video",
      AUDIO: "Audio",
      IMAGE: "Image",
      URL: "External Link",
      QUIZ: "Practice Quiz",
      H5P: "Interactive",
      SCORM: "SCORM",
    };
    return types[contentType] || contentType;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Review Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Finding recommendations...
          </span>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Review Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to Load Recommendations</AlertTitle>
            <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No recommendations
  if (!data?.recommendations?.length) {
    return null; // Don't show the component if there are no recommendations
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Recommended Review Materials
        </CardTitle>
        <CardDescription>
          Based on your assessment results, we suggest reviewing these topics to
          strengthen your understanding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.recommendations.map((recommendation) => (
          <div
            key={`${recommendation.type}-${recommendation.id}`}
            className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-medium text-base truncate">
                  {recommendation.title}
                </h4>
                {getPriorityBadge(recommendation.priority)}
                <Badge variant="outline" className="text-xs">
                  {getContentTypeLabel(recommendation.content_type)}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {recommendation.reason}
              </p>

              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{recommendation.course_title}</span>
                {" > "}
                <span>{recommendation.module_title}</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0 self-start sm:self-center">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/learner/courses/${recommendation.course_slug}/learn?module=${recommendation.module_id}&content=${recommendation.id}`}
                >
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {data.count > limit && (
          <p className="text-sm text-center text-muted-foreground pt-2">
            Showing {data.recommendations.length} of {data.count} recommendations
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default RemedialRecommendations;
