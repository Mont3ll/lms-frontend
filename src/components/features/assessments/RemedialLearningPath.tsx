"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertTriangle,
  Route,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import {
  checkRemedialPathAvailability,
  getApiErrorMessage,
  apiClient,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RemedialLearningPathProps {
  /** The attempt ID to check eligibility for */
  attemptId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RemedialLearningPath Component
 *
 * Checks if a learner is eligible for a personalized remedial learning path
 * based on their failed assessment attempt, and provides the ability to generate one.
 */
export function RemedialLearningPath({
  attemptId,
  className,
}: RemedialLearningPathProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [generatedPathId, setGeneratedPathId] = useState<string | null>(null);

  // Check eligibility for remedial path
  const {
    data: availability,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["remedialPathAvailability", attemptId],
    queryFn: () => checkRemedialPathAvailability(attemptId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!attemptId,
  });

  // Mutation to generate the remedial path
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!availability?.generate_url || !availability?.generate_payload) {
        throw new Error("Cannot generate path: missing configuration");
      }
      const response = await apiClient.post(availability.generate_url, availability.generate_payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["personalizedPaths"] });
      queryClient.invalidateQueries({ queryKey: ["remedialPathAvailability", attemptId] });
      
      // Store the generated path ID for navigation
      if (data?.id) {
        setGeneratedPathId(data.id);
      }
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Checking eligibility...
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
            <Route className="h-5 w-5" />
            Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to Check Eligibility</AlertTitle>
            <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Not eligible or no data
  if (!availability || !availability.is_eligible) {
    // If user passed, don't show the component at all
    if (availability?.attempt_info?.is_passed === true) {
      return null;
    }

    // If not graded yet, don't show
    if (availability?.attempt_info?.status !== "GRADED") {
      return null;
    }

    // Show reason why not eligible
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-muted-foreground" />
            Personalized Learning Path
          </CardTitle>
          <CardDescription>
            A customized path to help you master the skills from this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not Available</AlertTitle>
            <AlertDescription>
              {availability?.reason || "Remedial learning path is not available for this attempt."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Successfully generated - show navigation to the path
  if (generateMutation.isSuccess && generatedPathId) {
    return (
      <Card className={cn("border-green-200 bg-green-50/50", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Learning Path Generated!
          </CardTitle>
          <CardDescription>
            Your personalized learning path has been created based on your assessment results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This path includes targeted content to help you strengthen the skills you need to improve.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push(`/learner/paths/${generatedPathId}`)}
            className="w-full"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            View Your Learning Path
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Eligible - show generate option
  return (
    <Card className={cn("border-amber-200 bg-amber-50/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Route className="h-5 w-5" />
          Personalized Learning Path Available
        </CardTitle>
        <CardDescription>
          {availability.reason}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-amber-100">
          <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">What you&apos;ll get:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Targeted content for skills you need to improve</li>
              <li>Structured learning sequence</li>
              <li>Progress tracking to measure your growth</li>
            </ul>
          </div>
        </div>

        {generateMutation.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(generateMutation.error)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Path...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate My Learning Path
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RemedialLearningPath;
