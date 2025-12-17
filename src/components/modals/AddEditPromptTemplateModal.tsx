"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PromptTemplate } from "@/lib/types";
import { createAIPromptTemplate, updateAIPromptTemplate, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Loader2, X } from "lucide-react";

const promptTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  template_text: z.string().min(1, "Template text is required"),
  variables: z.string().optional(),
  default_model_config: z.string().optional(),
});

type PromptTemplateFormData = z.infer<typeof promptTemplateSchema>;

interface AddEditPromptTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PromptTemplate;
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
      name: "",
      description: "",
      template_text: "",
      variables: "",
      default_model_config: "",
    },
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name || "",
        description: template.description || "",
        template_text: template.template_text || "",
        variables: template.variables ? JSON.stringify(template.variables) : "",
        default_model_config: template.default_model_config || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        template_text: "",
        variables: "",
        default_model_config: "",
      });
    }
  }, [template, form]);

  const mutation = useMutation({
    mutationFn: (data: PromptTemplateFormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        template_text: data.template_text,
        variables: data.variables ? JSON.parse(data.variables) : null,
        default_model_config: data.default_model_config || null,
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
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
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
              name="template_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Text</FormLabel>
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
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variables (JSON Array)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='["course_title", "audience", "difficulty_level"]'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    JSON array of variable names used in the template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_model_config"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Model Config ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Model config UUID"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    ID of the default model configuration to use with this template
                  </FormDescription>
                  <FormMessage />
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
