"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { DiscussionThreadListItem } from "@/lib/types";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Megaphone,
  Bookmark,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscussionThreadItemProps {
  thread: DiscussionThreadListItem;
  courseSlug: string;
}

export function DiscussionThreadItem({
  thread,
  courseSlug,
}: DiscussionThreadItemProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isLocked = thread.status === "LOCKED";
  const isClosed = thread.status === "CLOSED";

  return (
    <Link href={`/learner/courses/${courseSlug}/discussions/${thread.id}`}>
      <Card
        className={cn(
          "hover:bg-accent/50 transition-colors cursor-pointer",
          thread.has_new_replies && "border-l-4 border-l-primary"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {thread.is_pinned && (
                <Pin className="h-4 w-4 text-primary shrink-0" />
              )}
              {thread.is_announcement && (
                <Megaphone className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <h3 className="font-medium text-sm truncate">{thread.title}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {thread.is_bookmarked && (
                <Bookmark className="h-4 w-4 text-primary fill-current" />
              )}
              {isLocked && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
              {isClosed && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Closed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(
                    thread.author.first_name,
                    thread.author.last_name
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {thread.author.full_name ||
                  `${thread.author.first_name} ${thread.author.last_name}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(thread.last_activity_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {thread.reply_count}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {thread.like_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {thread.view_count}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
