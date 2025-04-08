"use client";

import React from "react";
import { useParams } from "next/navigation"; // To get slug from URL
import { useQuery } from "@tanstack/react-query";
import { fetchCourseDetails } from "@/lib/api"; // Assuming API function exists
import { QUERY_KEYS } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // For modules
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Terminal,
  CheckCircle,
  Radio,
  PlayCircle,
  FileText,
  Link as LinkIcon,
} from "lucide-react"; // Icons for content types
import Link from "next/link"; // For content item links
import { cn } from "@/lib/utils"; // For conditional styling

// Placeholder for Content Item Renderer component
const ContentItemRenderer = ({ item }: { item: any }) => {
  // TODO: Implement rendering logic based on item.content_type
  // e.g., display text, embed video, link to assessment attempt page
  return (
    <div>
      Render {item.content_type}: {item.title}
    </div>
  );
};

// Placeholder for getting content item status (requires progress data)
const getContentItemStatus = (
  itemId: string,
  progressData: any,
): "completed" | "in_progress" | "not_started" => {
  // TODO: Implement logic to check progressData for the itemId
  return "not_started"; // Default
};

const ContentItemLink = ({
  item,
  courseSlug,
  progressData,
}: {
  item: any;
  courseSlug: string;
  progressData: any;
}) => {
  // TODO: Determine correct href based on content type
  // Maybe modal for text, page for video/assessment?
  const href = `/courses/${courseSlug}/content/${item.id}`; // Example link structure
  const status = getContentItemStatus(item.id, progressData);
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  let Icon = LinkIcon; // Default icon
  if (item.content_type === "VIDEO") Icon = PlayCircle;
  if (item.content_type === "TEXT") Icon = FileText;
  if (item.content_type === "QUIZ") Icon = CheckSquare; // Assuming Assessment icon
  if (item.content_type === "DOCUMENT") Icon = FileText;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors",
        // TODO: Add styling based on current active item?
      )}
    >
      <div className="flex items-center gap-3">
        {isCompleted ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : isInProgress ? (
          <Radio className="h-4 w-4 text-primary animate-pulse" /> // Indicate in progress
        ) : (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
        <span
          className={cn(
            "text-sm",
            isCompleted && "text-muted-foreground line-through",
          )}
        >
          {item.title}
        </span>
      </div>
      {/* Optional: Add duration/points */}
      {/* <span className="text-xs text-muted-foreground">5 min</span> */}
    </Link>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = params.courseId as string; // Assuming folder name is courseId maps to slug

  const {
    data: course,
    isLoading,
    error,
    isError,
  } = useQuery({
    // Pass slug to query key for unique caching
    queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
    queryFn: () => fetchCourseDetails(courseSlug),
    enabled: !!courseSlug, // Only run query if slug is available
  });

  // TODO: Fetch learner progress data for this course enrollment
  const progressData = {}; // Placeholder

  const renderSkeletons = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" /> {/* Title */}
      <Skeleton className="h-4 w-1/2" /> {/* Description line */}
      <Skeleton className="h-4 w-1/3" /> {/* Instructor/Meta */}
      <div className="space-y-3 mt-6">
        {/* Module Skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-md p-4 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-6">{renderSkeletons()}</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Course</AlertTitle>
          <AlertDescription>
            Could not fetch details for this course. Please try again later.
            {/* Error: {error?.message} */}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    // Handle case where query succeeded but returned no data (e.g., 404 handled by query?)
    // This case might be better handled by checking error status from react-query
    return (
      <div className="p-6">
        <p>Course not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Course Content/Structure (Left side or main area) */}
      <div className="flex-grow lg:w-2/3">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground mb-4 text-sm">
          Instructor: {course.instructor?.full_name || "N/A"} | Status:{" "}
          {course.status_display}
        </p>
        {/* Optional: Course description */}
        {course.description && (
          <p className="mb-6 text-sm">{course.description}</p>
        )}

        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Course Content
        </h2>
        {course.modules && course.modules.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={course.modules[0]?.id}
          >
            {course.modules.map((module) => (
              <AccordionItem value={module.id} key={module.id}>
                <AccordionTrigger className="text-base font-medium hover:no-underline">
                  {module.title} ({module.content_items?.length ?? 0} items)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 pl-4 border-l ml-1">
                    {(module.content_items ?? []).map((item) => (
                      <ContentItemLink
                        key={item.id}
                        item={item}
                        courseSlug={courseSlug}
                        progressData={progressData} // Pass progress data
                      />
                    ))}
                    {module.content_items?.length === 0 && (
                      <p className="text-sm text-muted-foreground p-3">
                        No content in this module yet.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground">
            No modules or content have been added to this course yet.
          </p>
        )}
      </div>

      {/* Content Display Area (Right side or dynamic area) */}
      <aside className="lg:w-1/3 lg:sticky lg:top-20 h-fit border rounded-lg bg-card p-4">
        {/*
                This area would typically render the selected ContentItem.
                Could use Next.js parallel routes or client-side routing
                to display content here when a ContentItemLink is clicked.
                For now, a placeholder.
            */}
        <h3 className="font-semibold mb-2">Content Viewer</h3>
        <div className="bg-muted h-60 rounded-md flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Select content from the list
          </p>
        </div>
        {/* Placeholder for ContentItemRenderer */}
        {/* <ContentItemRenderer item={selectedItem} /> */}
      </aside>
    </div>
  );
}
