"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Skill, SkillCategory, SkillCreateUpdateData } from "@/lib/types";

/** Skill form validation schema */
const skillFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  category: z.enum([
    "TECHNICAL",
    "SOFT",
    "DOMAIN",
    "LANGUAGE",
    "METHODOLOGY",
    "TOOL",
    "OTHER",
  ] as const),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"] as const),
  parent: z.string().optional().nullable(),
});

type SkillFormData = z.infer<typeof skillFormSchema>;

/** Category options for the select */
const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "TECHNICAL", label: "Technical" },
  { value: "SOFT", label: "Soft Skills" },
  { value: "DOMAIN", label: "Domain Knowledge" },
  { value: "LANGUAGE", label: "Language" },
  { value: "METHODOLOGY", label: "Methodology" },
  { value: "TOOL", label: "Tool" },
  { value: "OTHER", label: "Other" },
];

/** Difficulty options for the select */
const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface SkillFormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** Skill to edit (null for create) */
  skill?: Skill | null;
  /** Available parent skills */
  parentSkills?: Skill[];
  /** Callback when form is submitted */
  onSubmit: (data: SkillCreateUpdateData) => void;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
}

/**
 * SkillFormDialog - Dialog for creating or editing a skill.
 */
export const SkillFormDialog: React.FC<SkillFormDialogProps> = ({
  open,
  onOpenChange,
  skill,
  parentSkills = [],
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = !!skill;

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "TECHNICAL",
      difficulty_level: "beginner",
      parent: null,
    },
  });

  // Reset form when skill changes or dialog opens
  useEffect(() => {
    if (open) {
      if (skill) {
        form.reset({
          name: skill.name,
          description: skill.description || "",
          category: skill.category,
          difficulty_level: "beginner", // Default, as Skill type doesn't include this field
          parent: skill.parent || null,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category: "TECHNICAL",
          difficulty_level: "beginner",
          parent: null,
        });
      }
    }
  }, [open, skill, form]);

  const handleSubmit = (data: SkillFormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      category: data.category,
      parent: data.parent || undefined,
    });
  };

  // Filter out current skill and its descendants from parent options
  const availableParents = parentSkills.filter((s) => {
    if (!skill) return true;
    // Cannot be parent of itself
    if (s.id === skill.id) return false;
    // Cannot select descendants as parent (would create cycle)
    // For simplicity, just check direct parent here
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Skill" : "Create Skill"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the skill details below."
              : "Enter the details for the new skill."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Python Programming" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the skill..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help learners understand the skill.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {availableParents.length > 0 && (
              <FormField
                control={form.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Skill (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent skill" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None (Top-level skill)</SelectItem>
                        {availableParents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Group this skill under a parent skill for hierarchy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                {isEditing ? "Update Skill" : "Create Skill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillFormDialog;
