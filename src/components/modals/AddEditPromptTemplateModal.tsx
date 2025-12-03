"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { AIPromptTemplate } from "@/lib/types/ai";
import { createAIPromptTemplate, updateAIPromptTemplate, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Loader2, X } from "lucide-react";

const promptTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Name is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  template_type: z.enum(["custom", "course_generation", "assessment_creation", "content_enhancement", "feedback_generation"], {
    required_error: "Please select a template type",
  }),
  template_content: z.string().min(1, "Template content is required"),
  model_config: z.number().min(1, "Please select a model configuration"),
  input_variables: z.string().optional(),
  system_prompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(100000).optional(),
  is_active: z.boolean(),
  tags: z.string().optional(),
});

type PromptTemplateFormData = z.infer<typeof promptTemplateSchema>;

interface AddEditPromptTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: AIPromptTemplate;
}

export function AddEditPromptTemplateModal({
  isOpen,
  onClose,
  template,
}: AddEditPromptTemplateModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!template;

  const form = useForm<PromptTemplateFormData>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      template_type: template?.template_type || "custom",
      template_content: template?.template_content || "",
      model_config: template?.model_config || 0,
      input_variables: template?.input_variables ? template.input_variables.join(", ") : "",
      system_prompt: "",
      temperature: 0.7,
      max_tokens: 4096,
      is_active: template?.is_active ?? true,
      tags: template?.tags ? template.tags.join(", ") : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PromptTemplateFormData) => {
      const payload = {
        ...data,
        input_variables: data.input_variables ? JSON.parse(data.input_variables) : [],
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [],
      };
      
      if (isEditing) {
        return updateAIPromptTemplate(template.id, payload);
      }
      return createAIPromptTemplate(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? "Prompt template updated successfully!" : "Prompt template created successfully!"
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_PROMPT_TEMPLATES] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(
        isEditing ? "Failed to update prompt template" : "Failed to create prompt template",
        {
          description: getApiErrorMessage(error),
        }
      );
    },
  });

  const onSubmit = (data: PromptTemplateFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1.5 text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              {isEditing ? "Edit Prompt Template" : "Add Prompt Template"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update the AI prompt template settings."
                : "Create a new AI prompt template for content generation."}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Course Introduction Generator" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this prompt template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course_generation">Course Generation</SelectItem>
                        <SelectItem value="assessment_creation">Assessment Creation</SelectItem>
                        <SelectItem value="content_enhancement">Content Enhancement</SelectItem>
                        <SelectItem value="feedback_generation">Feedback Generation</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this prompt template is used for..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the template&apos;s purpose and usage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Create a comprehensive course introduction for {{course_title}} targeting {{audience}}..."
                      {...field}
                      rows={8}
                    />
                  </FormControl>
                  <FormDescription>
                    The prompt template with placeholders (use {`{{variable_name}}`} syntax)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="system_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are an expert educational content creator..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    System-level instructions to guide the AI&apos;s behavior
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="input_variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Variables (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='["course_title", "audience", "difficulty_level"]'
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON array of variable names used in the template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls creativity (0 = deterministic, 2 = very creative)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_tokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum length of generated content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="education, course, beginner"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags for categorizing this template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this prompt template for use
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

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Template
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}