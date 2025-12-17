"use client";

import React, { useCallback } from "react";
import {
  CourseFormProvider,
  useCourseForm,
} from "./_components/CourseFormContext";
import { CourseDetailsStep } from "./_components/CourseDetailsStep";
import { CourseModulesStep } from "./_components/CourseModulesStep";
import { CoursePublishStep } from "./_components/CoursePublishStep";
import { MultiStepFormWrapper } from "@/components/forms/MultiStepFormWrapper";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { useMutation } from "@tanstack/react-query";
import { createCourse, getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Define which form fields belong to each step for validation
const STEP_FIELDS = [
  // Step 0: Course Details
  ["title", "description", "category", "difficulty_level", "estimated_duration", "price"],
  // Step 1: Modules (optional content, no required fields)
  [],
  // Step 2: Publish settings
  ["status"],
] as const;

const STEP_LABELS = ["Course Details", "Modules", "Publish"];

function CreateCourseForm() {
  const { form } = useCourseForm();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      toast.success("Course Created", {
        description:
          "Course created successfully! You can now manage its content.",
      });
      router.push(`/instructor/courses/${data.slug}/modules`);
    },
    onError: (error) => {
      toast.error("Creation Failed", {
        description: `Failed to create course: ${getApiErrorMessage(error)}`,
      });
    },
  });

  // Validate specific fields for the current step
  const validateStep = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const fieldsToValidate = STEP_FIELDS[stepIndex];
      if (!fieldsToValidate || fieldsToValidate.length === 0) {
        // No fields to validate for this step
        return true;
      }
      // Use react-hook-form's trigger to validate specific fields
      const isValid = await form.trigger([...fieldsToValidate]);
      return isValid;
    },
    [form]
  );

  const handleFinalSubmit = () => {
    const courseData = form.getValues();
    const apiData = {
      title: courseData.title,
      description: courseData.description,
      status: courseData.status || "DRAFT",
    };
    console.log("Submitting course data:", apiData);
    mutation.mutate(apiData);
  };

  return (
    <PageWrapper title="Create New Course" description="Build a new course by adding details, modules, and content. Publish when ready for students.">
      <MultiStepFormWrapper
        onFinalSubmit={handleFinalSubmit}
        isSubmitting={mutation.isPending}
        validateStep={validateStep}
        stepLabels={STEP_LABELS}
      >
        <CourseDetailsStep />
        <CourseModulesStep />
        <CoursePublishStep />
      </MultiStepFormWrapper>
    </PageWrapper>
  );
}

export default function CreateCoursePage() {
  return (
    <CourseFormProvider>
      <CreateCourseForm />
    </CourseFormProvider>
  );
}
