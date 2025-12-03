"use client";

import React, { createContext, useContext, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
  estimated_duration: z.number().min(1, "Duration must be at least 1 hour"),
  price: z.number().min(0, "Price cannot be negative"),
  is_free: z.boolean(),
  thumbnail: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tags: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional(),
  module_outline: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormContextType {
  form: UseFormReturn<CourseFormValues>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

const CourseFormContext = createContext<CourseFormContextType | undefined>(undefined);

interface CourseFormProviderProps {
  children: React.ReactNode;
  defaultValues?: Partial<CourseFormValues>;
}

export function CourseFormProvider({ children, defaultValues }: CourseFormProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty_level: "beginner",
      estimated_duration: 1,
      price: 0,
      is_free: true,
      status: "DRAFT",
      tags: [],
      learning_objectives: [],
      ...defaultValues,
    },
  });

  const value = {
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
  };

  return (
    <CourseFormContext.Provider value={value}>
      {children}
    </CourseFormContext.Provider>
  );
}

export function useCourseForm() {
  const context = useContext(CourseFormContext);
  if (context === undefined) {
    throw new Error("useCourseForm must be used within a CourseFormProvider");
  }
  return context;
}