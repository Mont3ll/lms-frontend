"use client";

import React from "react";
import { useCourseForm } from "./CourseFormContext";
import { FormField } from "@/components/forms/FormField"; // Use your FormField wrapper
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import Textarea component if needed from shadcn/ui

export const CourseDetailsStep = () => {
  const {
    register,
    formState: { errors },
  } = useCourseForm(); // Get RHF methods from context

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details (Step 1/3)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Use FormField wrapper which uses useFormContext internally */}
        <FormField
          name="title"
          label="Course Title"
          placeholder="e.g., Introduction to Web Development"
          // register={register} // No need to pass register if FormField uses context
          // error={errors.title}
        />

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Provide a brief summary of the course..."
            {...register("description")}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Add fields for category, tags, thumbnail upload etc. */}
      </CardContent>
    </Card>
  );
};
