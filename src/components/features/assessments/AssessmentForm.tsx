"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FormField } from "@/components/forms/FormField";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/forms/SelectField";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/forms/DatePickerField"; // Date picker
// import { Assessment } from '@/lib/types'; // Type

// TODO: Define Assessment Schema in validators.ts
const assessmentSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional().nullable(),
  assessment_type: z.enum(["QUIZ", "EXAM", "ASSIGNMENT"]),
  grading_type: z.enum(["AUTO", "MANUAL", "HYBRID"]),
  due_date: z.date().optional().nullable(),
  time_limit_minutes: z.number().int().min(0).optional().nullable(),
  max_attempts: z.number().int().min(0),
  pass_mark_percentage: z.number().int().min(0).max(100),
  show_results_immediately: z.boolean(),
  shuffle_questions: z.boolean(),
  is_published: z.boolean(),
  // course: z.string().uuid(), // Assume course is passed via context or prop
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  initialData?: Partial<AssessmentFormValues>;
  onSubmit: (data: AssessmentFormValues) => Promise<void> | void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = "Save Assessment",
}) => {
  const methods = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: initialData || {
      title: "",
      assessment_type: "QUIZ",
      grading_type: "AUTO",
      max_attempts: 1,
      pass_mark_percentage: 50,
      show_results_immediately: true,
      shuffle_questions: false,
      is_published: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = methods;

  React.useEffect(() => {
    if (initialData) {
      methods.reset(initialData);
    }
  }, [initialData, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField name="title" label="Assessment Title" />
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                name="assessment_type"
                label="Assessment Type"
                options={[
                  { value: "QUIZ", label: "Quiz" },
                  { value: "EXAM", label: "Exam" },
                  { value: "ASSIGNMENT", label: "Assignment" },
                ]}
              />
              <SelectField
                name="grading_type"
                label="Grading Type"
                options={[
                  { value: "AUTO", label: "Automatic" },
                  { value: "MANUAL", label: "Manual" },
                  { value: "HYBRID", label: "Hybrid" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerField
                name="due_date"
                label="Due Date (Optional)"
              />
              <FormField
                name="time_limit_minutes"
                label="Time Limit (Minutes, 0 or blank for none)"
                type="number"
                min="0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="max_attempts"
                label="Max Attempts (0 for unlimited)"
                type="number"
                min="0"
              />
              <FormField
                name="pass_mark_percentage"
                label="Pass Mark (%)"
                type="number"
                min="0"
                max="100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Use CheckboxField or simple checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_results_immediately"
                  {...register("show_results_immediately")}
                />
                <Label htmlFor="show_results_immediately">
                  Show Results Immediately
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffle_questions"
                  {...register("shuffle_questions")}
                />
                <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_published" {...register("is_published")} />
                <Label htmlFor="is_published">Published</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
