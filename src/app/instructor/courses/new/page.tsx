"use client";

import React from "react";
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
// import { useToast } from '@/components/ui/use-toast'; // Remove this
import { toast } from "sonner"; // Import Sonner toast

function CreateCourseForm() {
  const { form } = useCourseForm();
  const router = useRouter();
  // const { toast: shadcnToast } = useToast(); // Remove this

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      // Use Sonner toast
      toast.success("Course Created", {
        description:
          "Course created successfully! You can now manage its content.",
      });
      router.push(`/instructor/courses/${data.slug}/modules`); // Redirect to module management
    },
    onError: (error) => {
      // Use Sonner toast
      toast.error("Creation Failed", {
        description: `Failed to create course: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const handleFinalSubmit = () => {
    const courseData = form.getValues();
    const apiData = {
      title: courseData.title,
      description: courseData.description,
      status: courseData.status || "DRAFT",
      // tags: courseData.tags,
    };
    console.log("Submitting course data:", apiData);
    mutation.mutate(apiData);
  };

  return (
    <PageWrapper title="Create New Course">
      <MultiStepFormWrapper
        onFinalSubmit={handleFinalSubmit}
        isSubmitting={mutation.isPending}
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
