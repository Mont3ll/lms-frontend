"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CourseFormProvider,
  useCourseForm,
} from "@/app/instructor/courses/new/_components/CourseFormContext";
import { CourseDetailsStep } from "@/app/instructor/courses/new/_components/CourseDetailsStep";
import { CoursePublishStep } from "@/app/instructor/courses/new/_components/CoursePublishStep";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCourseDetails,
  updateCourse,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
// import { useToast } from '@/components/ui/use-toast'; // Remove this
import { toast } from "sonner"; // Import Sonner toast
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, ArrowLeft } from "lucide-react";
import { courseSchema } from "@/lib/validators";
import * as z from "zod";
import { Button } from "@/components/ui/button"; // Added imports

type EditCourseFormData = z.infer<typeof courseSchema>;
void ({} as EditCourseFormData); // Suppress unused type warning - reserved for future use

function EditCourseForm({ courseSlug }: { courseSlug: string }) {
  // const { toast: shadcnToast } = useToast(); // Remove this
  const queryClient = useQueryClient();
  const router = useRouter(); // Import and use router if needed for cancel button

  const {
    data: courseData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.COURSE_DETAILS(courseSlug),
    queryFn: () => fetchCourseDetails(courseSlug),
    enabled: !!courseSlug,
  });

  const { form } = useCourseForm(); // Get form from context

  React.useEffect(() => {
    if (courseData) {
      // Map the course data to form structure properly and ensure all fields have values
      // Note: price comes from backend as a string (Decimal), convert to number for form
      const formData = {
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "",
        difficulty_level: courseData.difficulty_level || "beginner",
        estimated_duration: courseData.estimated_duration || 1,
        price: courseData.price ? parseFloat(courseData.price) : 0,
        is_free: courseData.is_free ?? true,
        status: courseData.status || "DRAFT",
        tags: courseData.tags || [],
        learning_objectives: courseData.learning_objectives || [],
        thumbnail: courseData.thumbnail || "",
      };
      
      // Use setTimeout to ensure the form is ready before resetting
      setTimeout(() => {
        form.reset(formData);
      }, 0);
    }
  }, [courseData, form]);

  const mutation = useMutation({
    mutationFn: (formData: z.infer<typeof courseSchema>) => {
      // Send all the form data, not just a subset
      // Note: price is converted to string for backend (Django Decimal)
      const apiData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        // Include other fields that might be available
        ...(formData.category && { category: formData.category }),
        ...(formData.difficulty_level && { difficulty_level: formData.difficulty_level }),
        ...(formData.estimated_duration && { estimated_duration: formData.estimated_duration }),
        ...(formData.price !== undefined && { price: String(formData.price) }),
        ...(formData.is_free !== undefined && { is_free: formData.is_free }),
        ...(formData.tags && { tags: formData.tags }),
        ...(formData.learning_objectives && { learning_objectives: formData.learning_objectives }),
        ...(formData.thumbnail && { thumbnail: formData.thumbnail }),
      };
      return updateCourse(courseSlug, apiData);
    },
    onSuccess: async (updatedCourse) => {
      // Use Sonner toast
      toast.success("Course Updated", {
        description: "Course details saved successfully.",
      });
      
      // Update the query cache with the fresh data
      queryClient.setQueryData(QUERY_KEYS.COURSE_DETAILS(courseSlug), updatedCourse);
      
      // Invalidate related queries to ensure consistency
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.COURSE_DETAILS(courseSlug),
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
      
      // Reset form with the updated data to ensure form reflects the saved state
      const formData = {
        title: updatedCourse.title || "",
        description: updatedCourse.description || "",
        category: updatedCourse.category || "",
        difficulty_level: updatedCourse.difficulty_level || "beginner",
        estimated_duration: updatedCourse.estimated_duration || 1,
        price: updatedCourse.price ? parseFloat(updatedCourse.price) : 0,
        is_free: updatedCourse.is_free ?? true,
        status: updatedCourse.status || "DRAFT",
        tags: updatedCourse.tags || [],
        learning_objectives: updatedCourse.learning_objectives || [],
        thumbnail: updatedCourse.thumbnail || "",
      };
      form.reset(formData);
    },
    onError: (error) => {
      // Use Sonner toast
      toast.error("Update Failed", {
        description: `Failed to update course: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const handleFormSubmit = async () => {
    try {
      // Trigger form validation
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Validation Failed", {
          description: "Please check the form for errors and try again.",
        });
        return;
      }

      const formData = form.getValues();
      mutation.mutate(formData);
    } catch {
      toast.error("Form Error", {
        description: "There was an error processing the form. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Course">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageWrapper>
    );
  }
  if (isError) {
    return (
      <PageWrapper title="Edit Course">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error loading course</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(error as Error)}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/instructor/courses')}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Course</h1>
            <p className="text-gray-600">{courseData?.title || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/instructor/courses')}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <CourseDetailsStep />
        <CoursePublishStep />
      </div>
    </div>
  );
}

export default function EditCoursePageWrapper() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  return (
    <CourseFormProvider>
      {" "}
      {/* Ensure Provider wraps the component */}
      <EditCourseForm courseSlug={courseSlug} />
    </CourseFormProvider>
  );
}
