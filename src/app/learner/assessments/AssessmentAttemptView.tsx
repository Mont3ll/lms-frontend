"use client"; // RHF requires client components

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Assessment } from "@/lib/types";
import { QuestionRenderer } from "@/components/features/assessments/QuestionRenderer";

interface AssessmentAttemptViewProps {
  assessment: Assessment; // Assessment details with questions
  formMethods: UseFormReturn<Record<string, string | number | boolean | string[]>>; // RHF methods passed down
  isSubmitting: boolean; // To disable form elements if needed
}

export const AssessmentAttemptView: React.FC<AssessmentAttemptViewProps> = ({
  assessment,
  isSubmitting,
}) => {
  const questions = assessment.questions || [];

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <fieldset key={question.id} disabled={isSubmitting} className="group">
          {" "}
          {/* Disable fieldset while submitting */}
          {/* QuestionRenderer uses FormProvider context */}
          <QuestionRenderer question={question} index={index + 1} />
        </fieldset>
      ))}
      {questions.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          This assessment does not contain any questions.
        </p>
      )}
    </div>
  );
};
