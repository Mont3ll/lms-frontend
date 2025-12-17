"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import {
  Bell,
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
  ArrowLeft,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { Notification, NotificationType, NotificationStatus } from "@/lib/types/notification";

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

// Map status to badge variant
function getStatusBadge(status: NotificationStatus) {
  switch (status) {
    case "READ":
      return { label: "Read", variant: "secondary" as const };
    case "SENT":
      return { label: "Unread", variant: "default" as const };
    case "PENDING":
      return { label: "Pending", variant: "outline" as const };
    case "DISMISSED":
      return { label: "Dismissed", variant: "secondary" as const };
    case "FAILED":
      return { label: "Failed", variant: "destructive" as const };
    default:
      return { label: status, variant: "outline" as const };
  }
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  isMarkingRead: boolean;
  isDismissing: boolean;
}

function NotificationCard({
  notification,
  onMarkRead,
  onDismiss,
  isMarkingRead,
  isDismissing,
}: NotificationCardProps) {
  const Icon = getNotificationIcon(notification.notification_type);
  const isUnread = notification.status !== "READ" && notification.status !== "DISMISSED";
  const statusBadge = getStatusBadge(notification.status);

  return (
    <Card className={cn(isUnread && "border-primary/30 bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                {notification.subject && (
                  <h3 className={cn("font-medium", isUnread && "font-semibold")}>
                    {notification.subject}
                  </h3>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </div>
              <Badge variant={statusBadge.variant} className="flex-shrink-0">
                {statusBadge.label}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
                <span className="hidden sm:inline">
                  {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
                <Badge variant="outline" className="text-xs">
                  {notification.notification_type_display || notification.notification_type}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notification.id)}
                    disabled={isMarkingRead}
                  >
                    {isMarkingRead ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Mark read</span>
                  </Button>
                )}
                {notification.action_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={notification.action_url}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">View</span>
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDismiss(notification.id)}
                  disabled={isDismissing}
                >
                  {isDismissing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="ml-1 hidden sm:inline">Dismiss</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Track which notifications are being acted upon
  const [markingReadIds, setMarkingReadIds] = React.useState<Set<string>>(new Set());
  const [dismissingIds, setDismissingIds] = React.useState<Set<string>>(new Set());

  const {
    data: notificationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, statusFilter],
    queryFn: () => {
      // Map UI filter to API parameter
      const params: Parameters<typeof fetchNotifications>[0] = {};
      if (statusFilter === "SENT") {
        params.is_read = false;
      } else if (statusFilter === "READ") {
        params.is_read = true;
      }
      // "all" and "DISMISSED" fetch all and filter client-side
      return fetchNotifications(params);
    },
  });

  const allNotifications = notificationsData?.results ?? [];
  // Client-side filter for DISMISSED status (not supported by API)
  const notifications = statusFilter === "DISMISSED" 
    ? allNotifications.filter(n => n.status === "DISMISSED")
    : allNotifications;
  const unreadCount = allNotifications.filter(
    (n) => n.status !== "READ" && n.status !== "DISMISSED"
  ).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: (notificationId) => {
      setMarkingReadIds((prev) => new Set(prev).add(notificationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
      toast.success("Notification marked as read");
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
      toast.success("Notification dismissed");
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
    <PageWrapper
      title="Notifications"
      className="max-w-4xl mx-auto pt-8"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                All Notifications
                {unreadCount > 0 && (
                  <Badge variant="default">{unreadCount} unread</Badge>
                )}
              </CardTitle>
              <CardDescription>
                View and manage all your notifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SENT">Unread</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="font-semibold mb-2">Failed to load notifications</h3>
              <p className="text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== "all"
                  ? "No notifications match the selected filter"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
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
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
