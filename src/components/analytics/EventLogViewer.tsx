"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  fetchEventLogs,
  fetchEventTypes,
  EventLog,
  EventLogFilters,
  EventType,
} from "@/lib/api";

const QUERY_KEY_EVENT_LOGS = "eventLogs";
const QUERY_KEY_EVENT_TYPES = "eventTypes";

const DEFAULT_PAGE_SIZE = 20;

// Device type icons
const DeviceIcon = ({ deviceType }: { deviceType: string | null }) => {
  const iconClass = "h-4 w-4";
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className={iconClass} />;
    case "tablet":
      return <Tablet className={iconClass} />;
    default:
      return <Monitor className={iconClass} />;
  }
};

// Event type badge colors
const getEventTypeBadgeVariant = (
  eventType: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (eventType.includes("error") || eventType.includes("fail")) {
    return "destructive";
  }
  if (eventType.includes("login") || eventType.includes("auth")) {
    return "default";
  }
  if (eventType.includes("view") || eventType.includes("page")) {
    return "secondary";
  }
  return "outline";
};

interface EventLogFiltersState {
  event_type: string;
  search: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  device_type: string;
}

export function EventLogViewer() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventLogFiltersState>({
    event_type: "",
    search: "",
    start_date: undefined,
    end_date: undefined,
    device_type: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<EventLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Build query params
  const queryParams: EventLogFilters = {
    page,
    page_size: DEFAULT_PAGE_SIZE,
  };

  if (filters.event_type) {
    queryParams.event_type = filters.event_type;
  }
  if (filters.search) {
    queryParams.search = filters.search;
  }
  if (filters.start_date) {
    queryParams.start_date = format(filters.start_date, "yyyy-MM-dd");
  }
  if (filters.end_date) {
    queryParams.end_date = format(filters.end_date, "yyyy-MM-dd");
  }
  if (filters.device_type) {
    queryParams.device_type = filters.device_type;
  }

  // Fetch event logs
  const {
    data: eventLogsResponse,
    isLoading: isLoadingLogs,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEY_EVENT_LOGS, queryParams],
    queryFn: () => fetchEventLogs(queryParams),
  });

  // Fetch event types for filter dropdown
  const { data: eventTypes = [] } = useQuery<EventType[]>({
    queryKey: [QUERY_KEY_EVENT_TYPES],
    queryFn: fetchEventTypes,
  });

  const events = eventLogsResponse?.results ?? [];
  const totalCount = eventLogsResponse?.count ?? 0;
  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

  const updateFilter = <K extends keyof EventLogFiltersState>(
    key: K,
    value: EventLogFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      event_type: "",
      search: "",
      start_date: undefined,
      end_date: undefined,
      device_type: "",
    });
    setPage(1);
  };

  const hasActiveFilters =
    filters.event_type ||
    filters.search ||
    filters.start_date ||
    filters.end_date ||
    filters.device_type;

  const handleViewDetails = (event: EventLog) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by user, email, session..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Event Type */}
        <div className="space-y-2 min-w-[180px]">
          <Label>Event Type</Label>
          <Select
            value={filters.event_type || "all"}
            onValueChange={(value) => updateFilter("event_type", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Device Type */}
        <div className="space-y-2 min-w-[150px]">
          <Label>Device</Label>
          <Select
            value={filters.device_type || "all"}
            onValueChange={(value) => updateFilter("device_type", value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All devices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All devices</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range - Start */}
        <div className="space-y-2">
          <Label>From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !filters.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.start_date ? (
                  format(filters.start_date, "MMM d, yyyy")
                ) : (
                  <span>Start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.start_date}
                onSelect={(date) => updateFilter("start_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range - End */}
        <div className="space-y-2">
          <Label>To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !filters.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.end_date ? (
                  format(filters.end_date, "MMM d, yyyy")
                ) : (
                  <span>End date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.end_date}
                onSelect={(date) => updateFilter("end_date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefetching && "animate-spin")}
            />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoadingLogs ? (
            <Skeleton className="h-4 w-32 inline-block" />
          ) : (
            `Showing ${events.length} of ${totalCount} events`
          )}
        </span>
      </div>

      {/* Table */}
      {isLoadingLogs ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No events found matching your criteria
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Badge variant={getEventTypeBadgeVariant(event.event_type)}>
                    {event.event_type_display || event.event_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {event.user_name || "Anonymous"}
                    </span>
                    {event.user_email && (
                      <span className="text-xs text-muted-foreground">
                        {event.user_email}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>
                      {format(new Date(event.created_at), "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DeviceIcon deviceType={event.device_type} />
                    <span className="text-sm capitalize">
                      {event.device_type || "Unknown"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.country || event.region ? (
                    <span>
                      {[event.region, event.country].filter(Boolean).join(", ")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unknown</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(event)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Event Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Full details for the selected event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {/* Event Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Event Type</Label>
                  <p className="font-medium">
                    <Badge
                      variant={getEventTypeBadgeVariant(
                        selectedEvent.event_type
                      )}
                    >
                      {selectedEvent.event_type_display ||
                        selectedEvent.event_type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-medium">
                    {format(
                      new Date(selectedEvent.created_at),
                      "PPpp"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">
                    {selectedEvent.user_name || "Anonymous"}
                  </p>
                  {selectedEvent.user_email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.user_email}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Session ID</Label>
                  <p className="font-mono text-sm break-all">
                    {selectedEvent.session_id || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">
                    {selectedEvent.ip_address || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">
                    {selectedEvent.country || selectedEvent.region
                      ? [selectedEvent.region, selectedEvent.country]
                          .filter(Boolean)
                          .join(", ")
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Device</Label>
                  <div className="flex items-center gap-2">
                    <DeviceIcon deviceType={selectedEvent.device_type} />
                    <span className="capitalize">
                      {selectedEvent.device_type || "Unknown"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Browser / OS</Label>
                  <p className="font-medium">
                    {[selectedEvent.browser, selectedEvent.os]
                      .filter(Boolean)
                      .join(" / ") || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Context Data */}
              {selectedEvent.context_data &&
                Object.keys(selectedEvent.context_data).length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Context Data</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedEvent.context_data, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
