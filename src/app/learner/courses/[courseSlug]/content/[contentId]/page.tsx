"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function ContentViewPage({
  params,
}: {
  params: Promise<{ courseSlug: string; contentId: string }>;
}) {
  const router = useRouter();
  const { courseSlug, contentId } = use(params);

  useEffect(() => {
    // TODO: Implement content viewing logic
    // For now, redirect back to course
    router.push(`/learner/courses/${courseSlug}`);
  }, [router, courseSlug, contentId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading content {contentId}...</p>
    </div>
  );
}
