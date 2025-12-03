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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckSquare 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
}

// Reserved for future module management feature
void ({} as Module);

export function CourseModulesStep() {
  const { form } = useCourseForm();

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Course Modules</h2>
          <p className="text-muted-foreground">
            Organize your course content into modules and lessons
          </p>
        </div>

        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            Module management will be available after creating the course. You can add and organize your course content from the course management page.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Structure
            </CardTitle>
            <CardDescription>
              Plan how you&apos;ll organize your course content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No modules yet</h3>
                <p className="text-muted-foreground mb-4">
                  After creating your course, you&apos;ll be able to add modules, lessons, and content.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video lessons</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Reading materials</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Assignments and quizzes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Planning Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Break your course into logical modules (topics/weeks)</li>
                <li>• Each module should have 3-7 lessons for optimal learning</li>
                <li>• Mix different content types (videos, readings, exercises)</li>
                <li>• Include assessments to check understanding</li>
                <li>• Consider the overall flow and progression</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Outline (Optional)</CardTitle>
            <CardDescription>
              Briefly outline your planned modules to help with course planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="module_outline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Outline</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Example:&#10;Module 1: Introduction to the topic&#10;Module 2: Core concepts and principles&#10;Module 3: Practical applications&#10;Module 4: Advanced techniques&#10;Module 5: Final project and wrap-up"
                      {...field}
                      rows={8}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a high-level outline of your planned modules. You can modify this later when building the actual course content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}