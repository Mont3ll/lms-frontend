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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { X, Plus } from "lucide-react";

export function CourseDetailsStep() {
  const { form } = useCourseForm();

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Course Details</h2>
          <p className="text-muted-foreground">
            Provide basic information about your course
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction to Web Development"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a clear, descriptive title for your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a comprehensive description of what students will learn..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what students will learn and achieve in this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="8"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      How many hours will it take to complete this course?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="99"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 if this is a free course (whole numbers only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/thumbnail.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a URL to an image that represents your course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>
              Define what students will achieve after completing this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="learning_objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Objectives</FormLabel>
                  <div className="space-y-2">
                    {(field.value || []).map((objective: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Learning objective ${index + 1}`}
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...(field.value || [])];
                            newObjectives[index] = e.target.value;
                            field.onChange(newObjectives);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newObjectives = (field.value || []).filter(
                              (_: string, i: number) => i !== index
                            );
                            field.onChange(newObjectives);
                          }}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newObjectives = [...(field.value || []), ""];
                        field.onChange(newObjectives);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Learning Objective
                    </Button>
                  </div>
                  <FormDescription>
                    Add specific learning outcomes students will achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & Categories</CardTitle>
            <CardDescription>
              Add tags to help students discover your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newTags = (field.value || []).filter(
                                (_: string, i: number) => i !== index
                              );
                              field.onChange(newTags);
                            }}
                            className="h-auto p-0 text-xs hover:bg-transparent"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value && !(field.value || []).includes(value)) {
                              const newTags = [...(field.value || []), value];
                              field.onChange(newTags);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const value = input.value.trim();
                          if (value && !(field.value || []).includes(value)) {
                            const newTags = [...(field.value || []), value];
                            field.onChange(newTags);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormDescription>
                    Add relevant tags to help with course discovery (press Enter or click + to add)
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
