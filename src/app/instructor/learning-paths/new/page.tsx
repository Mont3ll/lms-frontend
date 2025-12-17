"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FolderKanban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLearningPath, getApiErrorMessage } from "@/lib/api";

type LearningPathStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface FormData {
  title: string;
  description: string;
  status: LearningPathStatus;
}

export default function NewLearningPathPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "DRAFT",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newPath = await createLearningPath({
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
      });
      toast.success(`Learning path "${newPath.title}" created successfully!`);
      router.push(`/instructor/learning-paths/${newPath.slug}`);
    } catch (err) {
      console.error("Error creating learning path:", err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as LearningPathStatus }));
  };

  return (
    <PageWrapper
      title="Create Learning Path"
      description="Set up a new learning journey by combining courses into a guided pathway."
      actions={
        <Link href="/instructor/learning-paths">
          <Button variant="outline" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Learning Path Details</CardTitle>
                <CardDescription>
                  Provide the basic information for your new learning path. You can add courses after creating it.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Web Development"
                  disabled={isSubmitting}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what learners will achieve by completing this learning path..."
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  A good description helps learners understand the purpose and goals of this learning path.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Draft paths are only visible to instructors. Publish when ready for learners.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Learning Path"
                  )}
                </Button>
                <Link href="/instructor/learning-paths">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
