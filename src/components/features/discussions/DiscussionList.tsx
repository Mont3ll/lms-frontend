"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscussionThreadItem } from "./DiscussionThreadItem";
import { DiscussionThreadForm } from "./DiscussionThreadForm";
import { fetchDiscussionThreads } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api";
import { DiscussionThreadListItem } from "@/lib/types";
import { toast } from "sonner";
import {
  Search,
  Plus,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface DiscussionListProps {
  courseId: string;
  courseSlug: string;
  contentItemId?: string;
}

type SortOption = "recent" | "popular" | "oldest";
type FilterOption = "all" | "pinned" | "announcements" | "unanswered";

export function DiscussionList({
  courseId,
  courseSlug,
  contentItemId,
}: DiscussionListProps) {
  const [threads, setThreads] = useState<DiscussionThreadListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchDiscussionThreads({
        course_id: courseId,
        content_item_id: contentItemId,
        page: currentPage,
      });
      
      let filteredThreads = response.results;
      
      // Apply client-side filtering (backend may support these as query params too)
      if (filterBy === "pinned") {
        filteredThreads = filteredThreads.filter((t) => t.is_pinned);
      } else if (filterBy === "announcements") {
        filteredThreads = filteredThreads.filter((t) => t.is_announcement);
      } else if (filterBy === "unanswered") {
        filteredThreads = filteredThreads.filter((t) => t.reply_count === 0);
      }
      
      // Apply client-side search
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        filteredThreads = filteredThreads.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.author.full_name?.toLowerCase().includes(query) ||
            t.author.first_name.toLowerCase().includes(query) ||
            t.author.last_name.toLowerCase().includes(query)
        );
      }
      
      // Apply client-side sorting
      if (sortBy === "recent") {
        filteredThreads.sort(
          (a, b) =>
            new Date(b.last_activity_at).getTime() -
            new Date(a.last_activity_at).getTime()
        );
      } else if (sortBy === "popular") {
        filteredThreads.sort((a, b) => b.like_count - a.like_count);
      } else if (sortBy === "oldest") {
        filteredThreads.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      
      // Sort pinned threads to top
      filteredThreads.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });
      
      setThreads(filteredThreads);
      setTotalCount(response.count);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, contentItemId, currentPage, debouncedSearch, sortBy, filterBy]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const handleThreadCreated = () => {
    setShowNewThreadForm(false);
    setCurrentPage(1);
    loadThreads();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Discussions</h2>
          {totalCount > 0 && (
            <span className="text-sm text-muted-foreground">
              ({totalCount})
            </span>
          )}
        </div>
        <Button onClick={() => setShowNewThreadForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Discussion
        </Button>
      </div>

      {/* New Thread Form */}
      {showNewThreadForm && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-medium mb-3">Start a New Discussion</h3>
          <DiscussionThreadForm
            courseId={courseId}
            contentItemId={contentItemId}
            onSuccess={handleThreadCreated}
            onCancel={() => setShowNewThreadForm(false)}
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filterBy}
            onValueChange={(v) => setFilterBy(v as FilterOption)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threads</SelectItem>
              <SelectItem value="pinned">Pinned</SelectItem>
              <SelectItem value="announcements">Announcements</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thread List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-1">No discussions yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {debouncedSearch || filterBy !== "all"
              ? "No discussions match your search criteria."
              : "Be the first to start a discussion!"}
          </p>
          {!showNewThreadForm && !debouncedSearch && filterBy === "all" && (
            <Button onClick={() => setShowNewThreadForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Start a Discussion
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <DiscussionThreadItem
              key={thread.id}
              thread={thread}
              courseSlug={courseSlug}
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
  );
}
