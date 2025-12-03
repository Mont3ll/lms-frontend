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
import { courseSchema } from "@/lib/validators"; // Course schema

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Partial<CourseFormValues>;
  onSubmit: (data: CourseFormValues) => Promise<void> | void; // Make submit flexible
  isLoading?: boolean;
  submitButtonText?: string;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = "Save Course",
}) => {
  const methods = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      status: "DRAFT",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  // Effect to reset if initialData changes (useful if editing)
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
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField name="title" label="Course Title" />
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            {/* TODO: Add instructor selection if applicable (admin context) */}
            <SelectField
              name="status"
              label="Status"
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
            {/* Add fields for tags, category, thumbnail etc. */}
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
