"use client";

import React from "react";
import { useCourseForm } from "./CourseFormContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function CoursePublishStep() {
  const { form } = useCourseForm();

  const formData = form.getValues();

  // Check if course is ready for publishing
  const isReadyToPublish = !!(
    formData.title &&
    formData.description &&
    formData.category &&
    formData.difficulty_level &&
    formData.estimated_duration > 0
  );

  const publishingChecklist = [
    {
      label: "Course title provided",
      completed: !!formData.title,
      required: true,
    },
    {
      label: "Course description provided",
      completed: !!formData.description,
      required: true,
    },
    {
      label: "Category selected",
      completed: !!formData.category,
      required: true,
    },
    {
      label: "Difficulty level set",
      completed: !!formData.difficulty_level,
      required: true,
    },
    {
      label: "Duration estimated",
      completed: formData.estimated_duration > 0,
      required: true,
    },
    {
      label: "Price configured",
      completed: formData.price >= 0,
      required: false,
    },
    {
      label: "Thumbnail uploaded",
      completed: !!formData.thumbnail,
      required: false,
    },
  ];

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <p className="text-muted-foreground">
            Review your course details and publish when ready
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Publishing Checklist
              </CardTitle>
              <CardDescription>
                Ensure your course meets all requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publishingChecklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className={item.completed ? "text-green-700" : ""}>
                      {item.label}
                    </span>
                  </div>
                  {item.required && (
                    <Badge variant={item.completed ? "default" : "destructive"}>
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure final course settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publication Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem
                          value="PUBLISHED"
                          disabled={!isReadyToPublish}
                        >
                          Published
                        </SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!isReadyToPublish && (
                        <span className="text-orange-600">
                          Complete all required fields to enable publishing
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Course</FormLabel>
                      <FormDescription>
                        Make this course available for free
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Course Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Title:</strong> {formData.title || "Not set"}
                  </p>
                  <p>
                    <strong>Category:</strong> {formData.category || "Not set"}
                  </p>
                  <p>
                    <strong>Difficulty:</strong>{" "}
                    {formData.difficulty_level || "Not set"}
                  </p>
                  <p>
                    <strong>Duration:</strong> {formData.estimated_duration || 0}{" "}
                    hours
                  </p>
                  <p>
                    <strong>Thumbnail:</strong>{" "}
                    {formData.thumbnail ? "Provided" : "Not set"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pricing & Status</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Price:</strong>{" "}
                    {formData.is_free
                      ? "Free"
                      : `$${formData.price || 0}`}
                  </p>
                  <p>
                    <strong>Status:</strong> {formData.status || "DRAFT"}
                  </p>
                  <p>
                    <strong>Tags:</strong>{" "}
                    {formData.tags?.length
                      ? formData.tags.join(", ")
                      : "None"}
                  </p>
                  <p>
                    <strong>Learning Objectives:</strong>{" "}
                    {formData.learning_objectives?.length
                      ? `${formData.learning_objectives.length} objective(s)`
                      : "None"}
                  </p>
                </div>
              </div>
            </div>
            
            {formData.description && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {formData.description}
                </p>
              </div>
            )}
            
            {(formData.learning_objectives?.length ?? 0) > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Learning Objectives</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {formData.learning_objectives?.slice(0, 3).map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                  {(formData.learning_objectives?.length ?? 0) > 3 && (
                    <li className="text-xs italic">
                      +{(formData.learning_objectives?.length ?? 0) - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}