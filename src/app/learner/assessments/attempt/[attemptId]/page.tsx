"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function AssessmentAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const router = useRouter();
  const { attemptId } = use(params);

  useEffect(() => {
    // TODO: Implement attempt viewing logic
    // For now, redirect back to assessments
    router.push("/learner/assessments");
  }, [router, attemptId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading attempt {attemptId}...</p>
    </div>
  );
}
