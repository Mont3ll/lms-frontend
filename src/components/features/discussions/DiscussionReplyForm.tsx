"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createDiscussionReply } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

const replyFormSchema = z.object({
  content: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(10000, "Reply must be less than 10000 characters"),
});

type ReplyFormValues = z.infer<typeof replyFormSchema>;

interface DiscussionReplyFormProps {
  threadId: string;
  parentReplyId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function DiscussionReplyForm({
  threadId,
  parentReplyId,
  onSuccess,
  onCancel,
  placeholder = "Write your reply...",
  autoFocus = false,
}: DiscussionReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: ReplyFormValues) => {
    setIsSubmitting(true);
    try {
      await createDiscussionReply({
        thread: threadId,
        parent_reply: parentReplyId,
        content: data.content,
      });
      toast.success("Reply posted successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={placeholder}
                  className="min-h-[80px] resize-none"
                  autoFocus={autoFocus}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? "Posting..." : "Reply"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
