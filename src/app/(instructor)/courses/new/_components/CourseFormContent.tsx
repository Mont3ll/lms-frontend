"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema } from "@/lib/validators"; // Base schema, steps might validate parts
import * as z from "zod";

// Define the shape of your form data
type CourseFormData = z.infer<typeof courseSchema>; // Adjust based on full form needs

// Create context
const CourseFormContext = createContext<
  UseFormReturn<CourseFormData> | undefined
>(undefined);

// Create provider component
export const CourseFormProvider = ({ children }: { children: ReactNode }) => {
  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema), // Use a combined schema or validate per step
    defaultValues: {
      title: "",
      description: "",
      status: "DRAFT",
      // Initialize other fields
    },
    // mode: 'onChange' // Or 'onBlur' for validation timing
  });

  return (
    <FormProvider {...methods}>
      {" "}
      {/* Pass methods to RHF FormProvider */}
      {children}
    </FormProvider>
  );
};

// Custom hook to use the form context
export const useCourseForm = (): UseFormReturn<CourseFormData> => {
  const context = useContext(CourseFormContext);
  if (!context) {
    throw new Error("useCourseForm must be used within a CourseFormProvider");
  }
  // RHF FormProvider passes down methods directly, so we access them via useFormContext
  return useFormContext<CourseFormData>();
};
