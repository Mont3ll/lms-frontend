"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DiscussionReplyForm } from "./DiscussionReplyForm";
import { DiscussionReplyItem } from "./DiscussionReplyItem";
import {
  fetchDiscussionThread,
  fetchDiscussionReplies,
  toggleDiscussionThreadLike,
  toggleDiscussionThreadBookmark,
  markDiscussionThreadViewed,
  toggleDiscussionThreadPin,
  toggleDiscussionThreadLock,
  deleteDiscussionThread,
  getApiErrorMessage,
} from "@/lib/api";
import { DiscussionThread, DiscussionReply } from "@/lib/types";
import { toast } from "sonner";
import {
  ThumbsUp,
  Bookmark,
  MessageSquare,
  Eye,
  MoreHorizontal,
  Pin,
  Lock,
  Unlock,
  Megaphone,
  ArrowLeft,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DiscussionThreadViewProps {
  threadId: string;
  courseSlug: string;
  currentUserId?: string;
  isInstructor?: boolean;
}

export function DiscussionThreadView({
  threadId,
  courseSlug,
  currentUserId,
  isInstructor = false,
}: DiscussionThreadViewProps) {
  const router = useRouter();
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReplies, setTotalReplies] = useState(0);
  const pageSize = 20;

  const isAuthor = currentUserId === thread?.author.id;
  const canModerate = isInstructor || isAuthor;
  const isLocked = thread?.status === "LOCKED";
  const isClosed = thread?.status === "CLOSED";

  const loadThread = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDiscussionThread(threadId);
      setThread(data);
      // Mark as viewed
      await markDiscussionThreadViewed(threadId);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  const loadReplies = useCallback(async () => {
    setIsLoadingReplies(true);
    try {
      const response = await fetchDiscussionReplies({
        thread_id: threadId,
        page: currentPage,
      });
      setReplies(response.results);
      setTotalReplies(response.count);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoadingReplies(false);
    }
  }, [threadId, currentPage]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    if (thread) {
      loadReplies();
    }
  }, [thread, loadReplies]);

  const handleLike = async () => {
    if (!thread) return;
    setIsLiking(true);
    try {
      const result = await toggleDiscussionThreadLike(threadId);
      setThread({
        ...thread,
        is_liked: result.liked,
        like_count: result.like_count,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!thread) return;
    setIsBookmarking(true);
    try {
      const result = await toggleDiscussionThreadBookmark(threadId);
      setThread({
        ...thread,
        is_bookmarked: result.bookmarked,
      });
      toast.success(result.bookmarked ? "Bookmarked" : "Bookmark removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsBookmarking(false);
    }
  };

  const handlePin = async () => {
    if (!thread) return;
    try {
      const result = await toggleDiscussionThreadPin(threadId);
      setThread({
        ...thread,
        is_pinned: result.is_pinned,
      });
      toast.success(result.is_pinned ? "Thread pinned" : "Thread unpinned");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleLock = async () => {
    if (!thread) return;
    try {
      const result = await toggleDiscussionThreadLock(threadId);
      setThread({
        ...thread,
        status: result.status,
      });
      toast.success(
        result.status === "LOCKED" ? "Thread locked" : "Thread unlocked"
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiscussionThread(threadId);
      toast.success("Thread deleted successfully");
      router.push(`/learner/courses/${courseSlug}/discussions`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReplySuccess = () => {
    loadReplies();
    if (thread) {
      setThread({
        ...thread,
        reply_count: thread.reply_count + 1,
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const totalPages = Math.ceil(totalReplies / pageSize);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium mb-2">Thread not found</h2>
        <p className="text-muted-foreground mb-4">
          This discussion thread may have been deleted.
        </p>
        <Button asChild variant="outline">
          <Link href={`/learner/courses/${courseSlug}/discussions`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discussions
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/learner/courses/${courseSlug}/discussions`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Discussions
      </Link>

      {/* Thread Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 min-w-0">
            {thread.is_pinned && (
              <Pin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            )}
            {thread.is_announcement && (
              <Megaphone className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <h1 className="text-xl font-semibold">{thread.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isLocked && (
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
            {isClosed && <Badge variant="outline">Closed</Badge>}
            {canModerate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthor && (
                    <DropdownMenuItem disabled>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isInstructor && (
                    <>
                      <DropdownMenuItem onClick={handlePin}>
                        <Pin className="h-4 w-4 mr-2" />
                        {thread.is_pinned ? "Unpin" : "Pin"} Thread
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLock}>
                        {isLocked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Thread
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Thread
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  {(isAuthor || isInstructor) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Thread
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitials(thread.author.first_name, thread.author.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {thread.author.full_name ||
                `${thread.author.first_name} ${thread.author.last_name}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Posted{" "}
              {formatDistanceToNow(new Date(thread.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Thread content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{thread.content}</p>
        </div>

        {/* Thread stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {thread.view_count} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(thread.is_liked && "text-primary")}
            >
              <ThumbsUp
                className={cn("h-4 w-4 mr-1", thread.is_liked && "fill-current")}
              />
              {thread.like_count > 0 && thread.like_count}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={cn(thread.is_bookmarked && "text-primary")}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4",
                  thread.is_bookmarked && "fill-current"
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Reply form */}
      {!isLocked && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Post a Reply</h3>
          <DiscussionReplyForm
            threadId={threadId}
            onSuccess={handleReplySuccess}
            placeholder="Share your thoughts..."
          />
        </div>
      )}

      {isLocked && (
        <div className="text-center py-6 bg-muted/30 rounded-lg">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            This thread is locked. No new replies can be posted.
          </p>
        </div>
      )}

      <Separator />

      {/* Replies section */}
      <div className="space-y-4">
        <h3 className="font-medium">
          Replies ({totalReplies})
        </h3>

        {isLoadingReplies ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No replies yet. Be the first to reply!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <DiscussionReplyItem
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onRefresh={loadReplies}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this thread? This will also delete
              all replies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
