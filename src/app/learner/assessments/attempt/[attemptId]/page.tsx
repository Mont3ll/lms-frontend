"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
} from "lucide-react";

import { fetchAssessmentAttemptResult, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/layouts/PageWrapper";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RemedialRecommendations } from "@/components/features/assessments/RemedialRecommendations";
import { RemedialLearningPath } from "@/components/features/assessments/RemedialLearningPath";

/**
 * Assessment Attempt Result Page
 *
 * Displays the results and details of a completed assessment attempt.
 * Shows score, pass/fail status, and feedback when available.
 */
export default function AssessmentAttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const router = useRouter();
  const { attemptId } = use(params);

  const {
    data: attempt,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["assessmentAttempt", attemptId],
    queryFn: () => fetchAssessmentAttemptResult(attemptId),
    enabled: !!attemptId,
  });

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Calculate percentage score
  const getScorePercentage = () => {
    if (!attempt?.score || !attempt?.max_score) return 0;
    return Math.round((attempt.score / attempt.max_score) * 100);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRADED":
        return <Badge variant="default">Graded</Badge>;
      case "SUBMITTED":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper title="Loading Results..." description="Fetching your assessment results.">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading attempt results...</p>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // Error state
  if (isError) {
    return (
      <PageWrapper title="Error" description="There was a problem loading the results.">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to Load Results</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(error)} Please try again later.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push("/learner/assessments")}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
      </PageWrapper>
    );
  }

  // Not found state
  if (!attempt) {
    return (
      <PageWrapper title="Not Found" description="The requested assessment attempt could not be found.">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Attempt Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The assessment attempt you&apos;re looking for could not be found.
            </p>
            <Button
              onClick={() => router.push("/learner/assessments")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  const scorePercentage = getScorePercentage();

  return (
    <PageWrapper title={attempt.assessment_title || "Assessment Results"} description="View your score, feedback, and attempt details.">
      <div className="space-y-6">
        {/* Results Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {attempt.assessment_title}
                </CardTitle>
                <CardDescription className="mt-1">
                  Submitted on {formatDate(attempt.end_time || attempt.start_time)}
                </CardDescription>
              </div>
              {getStatusBadge(attempt.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display (for graded attempts) */}
            {attempt.status === "GRADED" && attempt.score !== null && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-6 py-6">
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-5xl font-bold",
                        attempt.is_passed ? "text-green-600" : "text-destructive"
                      )}
                    >
                      {scorePercentage}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {attempt.score} / {attempt.max_score} points
                    </p>
                  </div>
                  <div className="h-20 w-20 flex items-center justify-center rounded-full border-4 border-muted">
                    {attempt.is_passed ? (
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    ) : (
                      <XCircle className="h-10 w-10 text-destructive" />
                    )}
                  </div>
                </div>

                <Progress
                  value={scorePercentage}
                  className={cn(
                    "h-3",
                    attempt.is_passed
                      ? "[&>div]:bg-green-600"
                      : "[&>div]:bg-destructive"
                  )}
                />

                <div className="flex justify-center">
                  <Badge
                    variant={attempt.is_passed ? "default" : "destructive"}
                    className="text-base px-4 py-1"
                  >
                    {attempt.is_passed ? (
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> Not Passed
                      </span>
                    )}
                  </Badge>
                </div>
              </div>
            )}

            {/* Pending Review Message */}
            {attempt.status === "SUBMITTED" && (
              <div className="text-center py-6 space-y-4">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Pending Review</h3>
                  <p className="text-muted-foreground">
                    Your submission is being reviewed. Results will be available
                    once grading is complete.
                  </p>
                </div>
              </div>
            )}

            {/* In Progress Message */}
            {attempt.status === "IN_PROGRESS" && (
              <div className="text-center py-6 space-y-4">
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <div>
                  <h3 className="font-semibold text-lg">Attempt In Progress</h3>
                  <p className="text-muted-foreground">
                    This attempt has not been submitted yet.
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Attempt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">{formatDate(attempt.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">
                    {attempt.end_time ? formatDate(attempt.end_time) : "Not submitted"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {attempt.graded_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graded:</span>
                    <span className="font-medium">{formatDate(attempt.graded_at)}</span>
                  </div>
                )}
                {attempt.graded_by_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graded by:</span>
                    <span className="font-medium">{attempt.graded_by_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Section */}
            {attempt.feedback && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">Instructor Feedback</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{attempt.feedback}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="border-t pt-6 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/learner/assessments")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </CardFooter>
        </Card>

        {/* Remedial Learning Path - shown for graded failed attempts */}
        {attempt.status === "GRADED" && !attempt.is_passed && (
          <RemedialLearningPath attemptId={attemptId} />
        )}

        {/* Remedial Recommendations - shown for failed attempts or low scores */}
        {attempt.status === "GRADED" && (!attempt.is_passed || scorePercentage < 80) && (
          <RemedialRecommendations attemptId={attemptId} />
        )}
      </div>
    </PageWrapper>
  );
}
