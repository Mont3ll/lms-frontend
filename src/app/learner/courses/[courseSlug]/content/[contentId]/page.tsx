"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

/**
 * Content View Page - Direct Link Handler
 * 
 * This page handles direct links to specific content items within a course.
 * It redirects to the course player page with the correct item selected,
 * which provides a consistent learning experience with the course outline
 * and progress tracking visible.
 */
export default function ContentViewPage({
  params,
}: {
  params: Promise<{ courseSlug: string; contentId: string }>;
}) {
  const router = useRouter();
  const { courseSlug, contentId } = use(params);

  useEffect(() => {
    // Redirect to the course player with the specific content item selected
    // The course player handles enrollment checks, progress tracking, and content rendering
    router.replace(`/learner/courses/${courseSlug}?item=${contentId}`);
  }, [router, courseSlug, contentId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading content...</p>
      </div>
    </div>
  );
}
