"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellDot,
  Check,
  CheckCheck,
  Loader2,
  ExternalLink,
  X,
  BookOpen,
  GraduationCap,
  FileCheck,
  Clock,
  Megaphone,
  AlertCircle,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { Notification, NotificationType } from "@/lib/types/notification";

// Map notification types to icons
const notificationIcons: Record<NotificationType, React.ElementType> = {
  COURSE_ENROLLMENT: BookOpen,
  COURSE_COMPLETION: GraduationCap,
  ASSESSMENT_SUBMISSION: FileCheck,
  ASSESSMENT_GRADED: FileCheck,
  CERTIFICATE_ISSUED: Award,
  DEADLINE_REMINDER: Clock,
  NEW_CONTENT_AVAILABLE: BookOpen,
  ANNOUNCEMENT: Megaphone,
  SYSTEM_ALERT: AlertCircle,
};

function getNotificationIcon(type: NotificationType): React.ElementType {
  return notificationIcons[type] || Bell;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  isMarkingRead: boolean;
  isDismissing: boolean;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  isMarkingRead,
  isDismissing,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.notification_type);
  const isUnread = notification.status !== "READ" && notification.status !== "DISMISSED";
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "flex gap-3 p-3 hover:bg-muted/50 transition-colors rounded-md",
        isUnread && "bg-muted/30"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {notification.subject && (
          <p className={cn("text-sm font-medium truncate", isUnread && "font-semibold")}>
            {notification.subject}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>

      <div className="flex-shrink-0 flex flex-col gap-1">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarkingRead}
            title="Mark as read"
          >
            {isMarkingRead ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
        )}
        {notification.action_url && (
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <Link href={notification.action_url} title="View details">
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => onDismiss(notification.id)}
          disabled={isDismissing}
          title="Dismiss"
        >
          {isDismissing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // Track which notifications are being acted upon
  const [markingReadIds, setMarkingReadIds] = React.useState<Set<string>>(new Set());
  const [dismissingIds, setDismissingIds] = React.useState<Set<string>>(new Set());

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => fetchNotifications({ is_read: false }), // Fetch unread notifications
    refetchInterval: 60000, // Refetch every minute
    enabled: open, // Only fetch when popover is open
  });

  const notifications = notificationsData?.results ?? [];
  const unreadCount = notifications.filter(
    (n) => n.status !== "READ" && n.status !== "DISMISSED"
  ).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: (notificationId) => {
      setMarkingReadIds((prev) => new Set(prev).add(notificationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read", {
        description: getApiErrorMessage(error),
      });
    },
    onSettled: (_, __, notificationId) => {
      setMarkingReadIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      toast.success(`Marked ${data.updated_count} notifications as read`);
    },
    onError: (error) => {
      toast.error("Failed to mark all as read", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissNotification,
    onMutate: (notificationId) => {
      setDismissingIds((prev) => new Set(prev).add(notificationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
    onError: (error) => {
      toast.error("Failed to dismiss notification", {
        description: getApiErrorMessage(error),
      });
    },
    onSettled: (_, __, notificationId) => {
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p>Failed to load notifications</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onDismiss={(id) => dismissMutation.mutate(id)}
                  isMarkingRead={markingReadIds.has(notification.id)}
                  isDismissing={dismissingIds.has(notification.id)}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm" asChild>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
