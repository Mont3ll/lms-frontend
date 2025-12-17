"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect learner profile to the main profile page.
 * This page exists for backwards compatibility but the main profile
 * functionality has been consolidated into /profile.
 */
export default function LearnerProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
