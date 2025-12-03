"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // For dynamic schema generation
import { Loader2, AlertTriangle, Timer, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuestionRenderer } from "@/components/features/assessments/QuestionRenderer"; // Component to render questions
import { ConfirmationDialog } from "@/components/features/common/ConfirmationDialog"; // For submit confirmation
import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from "@/lib/api"; // Assume API functions exist
import { Assessment, Question, AssessmentAttempt } from "@/lib/types"; // Import base types
import { getApiErrorMessage } from "@/lib/api";

// Helper to dynamically build validation schema based on questions
const buildAttemptSchema = (questions: Question[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  questions.forEach((q) => {
    // Basic required validation, adjust based on question type complexity
    // For non-required questions, add .optional()
    if (q.question_type === "MC" || q.question_type === "TF") {
      // Single choice might need string, multiple choice might need array
      // This basic version assumes string for simplicity, adjust as needed
      schemaShape[q.id] = z
        .string()
        .min(1, { message: "Please select an answer" });
    } else if (
      q.question_type === "SA" ||
      q.question_type === "ES" ||
      q.question_type === "CODE"
    ) {
      schemaShape[q.id] = z
        .string()
        .min(1, { message: "Please provide an answer" });
    }
    // Add validation for other types (Matching, Fill Blanks etc.)
  });
  return z.object(schemaShape);
};

export default function AssessmentAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const assessmentId = params.assessmentId as string;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptData, setAttemptData] = useState<AssessmentAttempt | null>(
    null,
  ); // Store finished attempt data
  const [assessmentInfo, setAssessmentInfo] = useState<Assessment | null>(null); // Store assessment details from start attempt
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // --- State & Data Fetching ---

  // Mutation to start the attempt
  const startMutation = useMutation({
    mutationFn: () => startAssessmentAttempt(assessmentId),
    onSuccess: (data) => {
      // Assuming API returns { attempt_id: string, start_time: string, time_limit_minutes: number | null, assessment: Assessment }
      setAttemptId(data.attempt_id);
      setAssessmentInfo(data.assessment); // Store assessment details including questions
      if (data.time_limit_minutes) {
        const endTime =
          new Date(data.start_time).getTime() +
          data.time_limit_minutes * 60 * 1000;
        setTimeLeft(Math.max(0, endTime - Date.now()));
      }
      toast.success("Attempt Started", {
        description: "Good luck!",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: `Could not start attempt: ${getApiErrorMessage(error)}`,
      });
      // Optionally redirect back if attempt cannot be started
      router.back();
    },
  });

  // Mutation to submit the attempt
  const submitMutation = useMutation({
    mutationFn: (answers: Record<string, string | number | boolean | string[]>) => {
      if (!attemptId) throw new Error("No active attempt ID");
      return submitAssessmentAttempt(attemptId, { answers });
    },
    onSuccess: (data: AssessmentAttempt) => {
      setAttemptData(data); // Store the submitted attempt result
      toast.success("Attempt Submitted", {
        description: "Your answers have been recorded.",
      });
      // Invalidate related queries if needed
      queryClient.invalidateQueries({
        queryKey: ["assessmentAttempts", assessmentId],
      }); // Example query key
    },
    onError: (error) => {
      toast.error("Submission Error", {
        description: `Could not submit attempt: ${getApiErrorMessage(error)}`,
      });
    },
  });

  // --- Form Handling ---
  // Dynamically create schema once questions are loaded
  const dynamicSchema = assessmentInfo
    ? buildAttemptSchema(assessmentInfo.questions || [])
    : z.object({});
  const methods = useForm<Record<string, string | number | boolean | string[]>>({
    // Use generic record for dynamic fields
    resolver: zodResolver(dynamicSchema),
    defaultValues: {}, // Default values populated when questions load? Or leave empty?
  });
  const {
    handleSubmit,
  } = methods;

  // Effect to start attempt on mount
  useEffect(() => {
    if (
      assessmentId &&
      !attemptId &&
      !startMutation.isPending &&
      !attemptData
    ) {
      startMutation.mutate();
    }
  }, [assessmentId, attemptId, startMutation, attemptData]);

  // Effect for timer
  useEffect(() => {
    if (
      timeLeft === null ||
      timeLeft <= 0 ||
      submitMutation.isSuccess ||
      attemptData?.status !== "IN_PROGRESS"
    ) {
      if (
        timeLeft !== null &&
        timeLeft <= 0 &&
        !isTimeUp &&
        !submitMutation.isSuccess &&
        attemptData?.status !== "GRADED" &&
        attemptData?.status !== "SUBMITTED"
      ) {
        setIsTimeUp(true);
        toast.error("Time's Up!", {
          description: "Submitting your attempt automatically.",
        });
        // Trigger automatic submission
        handleSubmit(onSubmit)(); // Submit with current form values
      }
      return; // Don't run timer if not applicable
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime ? Math.max(0, prevTime - 1000) : 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer
  }, [timeLeft, isTimeUp, submitMutation.isSuccess, attemptData, handleSubmit]); // Add handleSubmit to dependencies

  // --- Submission Logic ---
  const onSubmit = (data: Record<string, string | number | boolean | string[]>) => {
    console.log("Submitting answers:", data);
    if (attemptId && !submitMutation.isPending) {
      submitMutation.mutate(data);
    }
  };

  // --- Render Logic ---
  if (startMutation.isPending || (!assessmentInfo && !attemptData)) {
    return (
      <PageWrapper title="Loading Assessment...">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p>Preparing your assessment attempt...</p>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (startMutation.isError) {
    return (
      <PageWrapper title="Error">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to Start Attempt</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(startMutation.error)} Please go back and try
            again.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-4"
        >
          Go Back
        </Button>
      </PageWrapper>
    );
  }

  // --- Display Submitted Results ---
  if (submitMutation.isSuccess && attemptData) {
    const showResults = assessmentInfo?.show_results_immediately ?? false; // Default to not showing if assessmentInfo missing
    return (
      <PageWrapper title={assessmentInfo?.title ?? "Assessment Results"}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" /> Attempt Submitted
              Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your responses have been recorded.</p>
            {attemptData.status === "GRADED" && showResults ? (
              <div className="space-y-2 rounded-md border p-4 bg-muted/30">
                <h3 className="font-semibold">Your Results:</h3>
                <p>
                  Score:{" "}
                  <span className="font-bold">
                    {attemptData.score ?? "N/A"} /{" "}
                    {attemptData.max_score ?? "N/A"}
                  </span>
                </p>
                {attemptData.is_passed !== null && (
                  <p>
                    Status:{" "}
                    <span
                      className={cn(
                        "font-bold",
                        attemptData.is_passed
                          ? "text-green-600"
                          : "text-destructive",
                      )}
                    >
                      {attemptData.is_passed ? "Passed" : "Failed"}
                    </span>
                  </p>
                )}
                {attemptData.feedback && (
                  <p>Feedback: {attemptData.feedback}</p>
                )}
              </div>
            ) : attemptData.status === "SUBMITTED" ? (
              <p>Your score will be available once the assessment is graded.</p>
            ) : !showResults ? (
              <p>
                Results will be shown at a later time according to the
                assessment settings.
              </p>
            ) : null}
            <Button
              onClick={() => router.push(`/courses/${assessmentInfo?.course}`)}
              variant="outline"
            >
              Back to Course
            </Button>{" "}
            {/* Adjust link */}
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // --- Display Assessment Form ---
  if (assessmentInfo && attemptId) {
    const questions = assessmentInfo.questions || [];
    // const currentQuestionIndex = ...; // Logic for one-question-at-a-time view if needed

    const formatTime = (ms: number | null): string => {
      if (ms === null || ms < 0) return "--:--";
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
      <PageWrapper title={assessmentInfo.title}>
        <FormProvider {...methods}>
          {" "}
          {/* Provide form context */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <CardTitle>Attempting Assessment</CardTitle>
                  {timeLeft !== null && (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full border",
                        isTimeUp
                          ? "text-destructive border-destructive bg-destructive/10"
                          : "text-muted-foreground border-border",
                      )}
                    >
                      <Timer className="h-4 w-4" />
                      Time Remaining: {formatTime(timeLeft)}
                      {isTimeUp && (
                        <span className="ml-2 font-bold">(Time Expired)</span>
                      )}
                    </div>
                  )}
                </div>
                {assessmentInfo.description && (
                  <p className="text-sm text-muted-foreground pt-2">
                    {assessmentInfo.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {questions.map((question, index) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    index={index + 1}
                    // error={errors[question.id] as FieldError | undefined} // Pass error state
                  />
                ))}
                {questions.length === 0 && (
                  <p className="text-muted-foreground">
                    This assessment currently has no questions.
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                {/* Confirmation Dialog for Submit */}
                <ConfirmationDialog
                  triggerButton={
                    <Button
                      type="button"
                      disabled={submitMutation.isPending || isTimeUp}
                    >
                      {submitMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Assessment
                    </Button>
                  }
                  title="Confirm Submission"
                  description="Are you sure you want to submit your answers? You may not be able to change them afterwards."
                  confirmText="Yes, Submit Now"
                  onConfirm={handleSubmit(onSubmit)} // Trigger RHF submit on confirm
                  isDestructive={false}
                />
              </CardFooter>
            </Card>
          </form>
        </FormProvider>
      </PageWrapper>
    );
  }

  // Should not be reached if logic is correct, but include fallback
  return (
    <PageWrapper title="Assessment">
      <p>Loading assessment state...</p>
    </PageWrapper>
  );
}
