"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Clock,
  FileQuestion,
  Calendar,
  Target,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Play,
  Loader2,
  AlertTriangle,
  Trophy,
  ListChecks,
  Eye,
} from "lucide-react";

import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchAssessmentDetails,
  fetchAssessmentAttemptsForAssessment,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  // Fetch assessment details
  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error: assessmentError,
    isError: isAssessmentError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, assessmentId],
    queryFn: () => fetchAssessmentDetails(assessmentId),
    enabled: !!assessmentId,
  });

  // Fetch user's attempts for this assessment
  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
  } = useQuery({
    queryKey: QUERY_KEYS.ASSESSMENT_ATTEMPTS(assessmentId),
    queryFn: () => fetchAssessmentAttemptsForAssessment(assessmentId),
    enabled: !!assessmentId,
  });

  const attempts = attemptsData || [];
  const completedAttempts = attempts.filter(
    (a) => a.status === "GRADED" || a.status === "SUBMITTED"
  );
  const inProgressAttempt = attempts.find((a) => a.status === "IN_PROGRESS");
  const attemptsRemaining = assessment
    ? assessment.max_attempts - completedAttempts.length
    : 0;
  const canStartNewAttempt = attemptsRemaining > 0 && !inProgressAttempt;
  const hasPassed = completedAttempts.some((a) => a.is_passed === true);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return "No time limit";
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  // Loading state
  if (isLoadingAssessment) {
    return (
      <PageWrapper
        title="Loading Assessment..."
        description="Please wait while we load the assessment details."
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  if (isAssessmentError) {
    return (
      <PageWrapper
        title="Error"
        description="There was a problem loading the assessment."
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to Load Assessment</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(assessmentError)}
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

  if (!assessment) {
    return (
      <PageWrapper
        title="Not Found"
        description="The assessment could not be found."
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Assessment Not Found</AlertTitle>
          <AlertDescription>
            This assessment does not exist or you do not have access to it.
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

  return (
    <PageWrapper
      title={assessment.title}
      description={`${assessment.assessment_type_display} for ${assessment.course_title}`}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learner/assessments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessment Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{assessment.title}</CardTitle>
                  <CardDescription>
                    {assessment.course_title}
                  </CardDescription>
                </div>
                <Badge variant={hasPassed ? "default" : "secondary"}>
                  {hasPassed ? (
                    <>
                      <Trophy className="mr-1 h-3 w-3" />
                      Passed
                    </>
                  ) : (
                    assessment.assessment_type_display
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.description && (
                <p className="text-muted-foreground">{assessment.description}</p>
              )}

              <Separator />

              {/* Assessment Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Limit</p>
                    <p className="text-sm font-medium">
                      {formatDuration(assessment.time_limit_minutes)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="text-sm font-medium">
                      {assessment.questions?.length || 0} questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pass Mark</p>
                    <p className="text-sm font-medium">
                      {assessment.pass_mark_percentage}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Max Attempts</p>
                    <p className="text-sm font-medium">
                      {assessment.max_attempts}
                    </p>
                  </div>
                </div>
              </div>

              {assessment.due_date && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Due: {formatDate(assessment.due_date)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Previous Attempts Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Your Attempts
              </CardTitle>
              <CardDescription>
                {completedAttempts.length} of {assessment.max_attempts} attempts used
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAttempts ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>You haven&apos;t attempted this assessment yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt, index) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">
                          #{attempts.length - index}
                        </TableCell>
                        <TableCell>{formatDate(attempt.start_time)}</TableCell>
                        <TableCell>
                          {attempt.status === "GRADED" ? (
                            <span
                              className={cn(
                                "font-medium",
                                attempt.is_passed
                                  ? "text-green-600 dark:text-green-500"
                                  : "text-destructive"
                              )}
                            >
                              {attempt.score ?? 0}/{attempt.max_score ?? assessment.total_points}
                            </span>
                          ) : attempt.status === "IN_PROGRESS" ? (
                            <span className="text-muted-foreground">In Progress</span>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt.status === "GRADED" ? (
                            attempt.is_passed ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Passed
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )
                          ) : attempt.status === "IN_PROGRESS" ? (
                            <Badge variant="secondary">
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              In Progress
                            </Badge>
                          ) : (
                            <Badge variant="outline">Submitted</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {(attempt.status === "GRADED" || attempt.status === "SUBMITTED") && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/learner/assessments/attempt/${attempt.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Attempts Remaining */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Attempts remaining:</span>
                <span
                  className={cn(
                    "font-medium",
                    attemptsRemaining === 0
                      ? "text-destructive"
                      : attemptsRemaining === 1
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-green-600 dark:text-green-500"
                  )}
                >
                  {attemptsRemaining}
                </span>
              </div>

              {/* Status Messages */}
              {hasPassed && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <Trophy className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    You have already passed this assessment.
                  </AlertDescription>
                </Alert>
              )}

              {inProgressAttempt && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    You have an attempt in progress.
                  </AlertDescription>
                </Alert>
              )}

              {attemptsRemaining === 0 && !hasPassed && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have used all your attempts.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              {inProgressAttempt ? (
                <Button className="w-full" asChild>
                  <Link href={`/learner/assessments/${assessmentId}/attempt?attemptId=${inProgressAttempt.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Continue Attempt
                  </Link>
                </Button>
              ) : canStartNewAttempt ? (
                <Button className="w-full" asChild>
                  <Link href={`/learner/assessments/${assessmentId}/attempt`}>
                    <Play className="mr-2 h-4 w-4" />
                    {completedAttempts.length > 0 ? "Retry Assessment" : "Start Assessment"}
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  <XCircle className="mr-2 h-4 w-4" />
                  No Attempts Remaining
                </Button>
              )}

              {/* Info Notes */}
              <div className="text-xs text-muted-foreground space-y-1">
                {assessment.time_limit_minutes && (
                  <p>
                    Once started, you will have{" "}
                    {formatDuration(assessment.time_limit_minutes)} to complete.
                  </p>
                )}
                {assessment.show_results_immediately && (
                  <p>Results will be shown immediately after submission.</p>
                )}
                {!assessment.show_results_immediately && (
                  <p>Results will be available after grading is complete.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Rules Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">1.</span>
                  <span>
                    Answer all questions to the best of your ability.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">2.</span>
                  <span>
                    You need {assessment.pass_mark_percentage}% to pass this assessment.
                  </span>
                </li>
                {assessment.time_limit_minutes && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">3.</span>
                    <span>
                      The assessment will auto-submit when time runs out.
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">
                    {assessment.time_limit_minutes ? "4." : "3."}
                  </span>
                  <span>
                    Once submitted, answers cannot be changed.
                  </span>
                </li>
                {assessment.shuffle_questions && (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">
                      {assessment.time_limit_minutes ? "5." : "4."}
                    </span>
                    <span>
                      Questions may appear in a different order each attempt.
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
