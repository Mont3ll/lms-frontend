"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createDiscussionThread } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquarePlus, X } from "lucide-react";

const threadFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content must be less than 10000 characters"),
});

type ThreadFormValues = z.infer<typeof threadFormSchema>;

interface DiscussionThreadFormProps {
  courseId: string;
  contentItemId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DiscussionThreadForm({
  courseId,
  contentItemId,
  onSuccess,
  onCancel,
}: DiscussionThreadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ThreadFormValues>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: ThreadFormValues) => {
    setIsSubmitting(true);
    try {
      await createDiscussionThread({
        course: courseId,
        content_item: contentItemId,
        title: data.title,
        content: data.content,
      });
      toast.success("Discussion thread created successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquarePlus className="h-5 w-5" />
          Start a New Discussion
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What would you like to discuss?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about your question or topic..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Discussion"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
