"use client";

import React from "react";
import {
  CourseFormProvider,
  useCourseForm,
} from "./_components/CourseFormContext"; // Context for multi-step state
import { CourseDetailsStep } from "./_components/CourseDetailsStep";
import { CourseModulesStep } from "./_components/CourseModulesStep"; // Placeholder step
import { CoursePublishStep } from "./_components/CoursePublishStep"; // Placeholder step
import { MultiStepFormWrapper } from "@/components/forms/MultiStepFormWrapper"; // Use the wrapper
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { courseSchema } from "@/lib/validators"; // Assuming base course schema
import { useMutation } from "@tanstack/react-query";
import { createCourse } from "@/lib/api"; // API function
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/api";

// Define steps - components must align with MultiStepFormWrapper children order
const steps = [
  CourseDetailsStep,
  CourseModulesStep, // Placeholder for module/content management step
  CoursePublishStep, // Placeholder for final review/publish settings
];

function CreateCourseForm() {
  const { getValues } = useCourseForm(); // Get form values from context
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      toast({ title: "Success", description: "Course created successfully!" });
      // Redirect to the course edit page or management page
      router.push(`/courses/${data.slug}/edit`); // Or instructor courses list
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create course: ${getApiErrorMessage(error)}`,
        variant: "destructive",
      });
    },
  });

  const handleFinalSubmit = () => {
    const courseData = getValues();
    // Prepare data for API (might need adjustments based on API expectations)
    const apiData = {
      title: courseData.title,
      description: courseData.description,
      // instructor_id: ..., // Might be set by backend based on logged-in user
      status: courseData.status || "DRAFT", // Default or from publish step
      // tags: courseData.tags,
    };
    console.log("Submitting course data:", apiData);
    mutation.mutate(apiData);
  };

  return (
    <PageWrapper title="Create New Course">
      {/* MultiStepFormWrapper manages step navigation */}
      <MultiStepFormWrapper
        onFinalSubmit={handleFinalSubmit}
        isSubmitting={mutation.isPending}
      >
        {/* Render step components as children */}
        <CourseDetailsStep />
        <CourseModulesStep />
        <CoursePublishStep />
      </MultiStepFormWrapper>
    </PageWrapper>
  );
}

// Wrap the main component with the Form Provider
export default function CreateCoursePage() {
  return (
    <CourseFormProvider>
      <CreateCourseForm />
    </CourseFormProvider>
  );
}
