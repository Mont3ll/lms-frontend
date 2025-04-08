"use client";

import React from "react";
import { useParams } from "next/navigation";
// import { useQuery } from '@tanstack/react-query';
// import { fetchContentItemDetails } from '@/lib/api'; // Need API function

export default function ContentItemPage() {
  const params = useParams();
  const courseSlug = params.courseId as string;
  const contentId = params.contentId as string;

  // TODO: Fetch content item details using contentId
  // const { data: contentItem, isLoading, error } = useQuery({
  //   queryKey: ['contentItem', contentId],
  //   queryFn: () => fetchContentItemDetails(contentId),
  //   enabled: !!contentId,
  // });

  // Placeholder Content
  const isLoading = false;
  const error = null;
  const contentItem = {
    id: contentId,
    title: `Content Item ${contentId.substring(0, 4)}...`,
    content_type: "TEXT", // Example type
    text_content:
      "This is placeholder text content for the selected item. Replace with actual fetched content and renderer.",
    // Add other fields based on type
  };

  if (isLoading) {
    return <div className="p-6">Loading content...</div>; // Add Skeleton
  }

  if (error) {
    return <div className="p-6 text-destructive">Error loading content.</div>;
  }

  if (!contentItem) {
    return <div className="p-6">Content not found.</div>;
  }

  return (
    // This component might render *instead* of the right sidebar in CourseDetailPage,
    // OR it could render *within* that sidebar area using client-side logic or parallel routes.
    // Assuming it renders as a full page for simplicity here:
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{contentItem.title}</h1>
      {/* TODO: Implement ContentItemRenderer component */}
      {contentItem.content_type === "TEXT" && (
        <div className="prose dark:prose-invert max-w-none">
          {" "}
          {/* Basic text rendering */}
          <p>{contentItem.text_content}</p>
        </div>
      )}
      {contentItem.content_type === "VIDEO" && (
        <div>Video Player Placeholder</div>
      )}
      {/* Add renderers for other types */}

      {/* TODO: Add navigation (Prev/Next buttons) */}
      {/* TODO: Add 'Mark as Complete' button and integrate with progress service */}
      <div className="mt-6 pt-4 border-t">
        <button>Mark as Complete (Placeholder)</button>
      </div>
    </div>
  );
}
