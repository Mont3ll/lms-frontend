"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { toggleDiscussionReplyLike, deleteDiscussionReply } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { DiscussionReply } from "@/lib/types";
import { toast } from "sonner";
import {
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  EyeOff,
  CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscussionReplyItemProps {
  reply: DiscussionReply;
  currentUserId?: string;
  onRefresh?: () => void;
  depth?: number;
  maxDepth?: number;
}

export function DiscussionReplyItem({
  reply,
  currentUserId,
  onRefresh,
  depth = 0,
  maxDepth = 3,
}: DiscussionReplyItemProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.like_count);
  const [isLiked, setIsLiked] = useState(reply.is_liked);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = currentUserId === reply.author.id;
  const canReply = depth < maxDepth;

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const result = await toggleDiscussionReplyLike(reply.id);
      setIsLiked(result.liked);
      setLikeCount(result.like_count);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiscussionReply(reply.id);
      toast.success("Reply deleted successfully");
      onRefresh?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onRefresh?.();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (reply.is_hidden) {
    return (
      <div className={cn("py-3 px-4 bg-muted/50 rounded-md", depth > 0 && "ml-8")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <EyeOff className="h-4 w-4" />
          <span>This reply has been hidden by a moderator</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(reply.author.first_name, reply.author.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {reply.author.full_name ||
                `${reply.author.first_name} ${reply.author.last_name}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(reply.created_at), {
                addSuffix: true,
              })}
            </span>
            {reply.is_edited && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                edited
              </Badge>
            )}
          </div>

          <div className="text-sm whitespace-pre-wrap">{reply.content}</div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                isLiked && "text-primary"
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              <ThumbsUp className={cn("h-3 w-3 mr-1", isLiked && "fill-current")} />
              {likeCount > 0 && likeCount}
            </Button>

            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-11">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <CornerDownRight className="h-3 w-3" />
            <span>
              Replying to {reply.author.first_name} {reply.author.last_name}
            </span>
          </div>
          <DiscussionReplyForm
            threadId={reply.thread}
            parentReplyId={reply.id}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${reply.author.first_name}...`}
            autoFocus
          />
        </div>
      )}

      {/* Nested replies */}
      {reply.child_replies && reply.child_replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {reply.child_replies.map((childReply) => (
            <DiscussionReplyItem
              key={childReply.id}
              reply={childReply}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reply</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reply? This action cannot be
              undone.
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
