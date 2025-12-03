"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
// Dashboard components - these are imported for reference but not rendered here
// The page redirects to the appropriate dashboard based on user role
// import LearnerDashboard from "@/app/learner/dashboard/page";
// import InstructorDashboard from "@/app/instructor/dashboard/page";
// import AdminDashboard from "@/app/admin/dashboard/page";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Option 1: Client-side redirect based on role
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case "ADMIN":
          router.replace("/admin/dashboard"); // Use replace to avoid history entry
          break;
        case "INSTRUCTOR":
          router.replace("/instructor/dashboard");
          break;
        case "LEARNER":
          router.replace("/learner/dashboard");
          break;
        default:
          router.replace("/login"); // Fallback if role unknown
      }
    } else if (!isLoading && !user) {
      router.replace("/login"); // Redirect if somehow landed here unauthenticated
    }
  }, [user, isLoading, router]);

  // Option 2: Render the correct dashboard component directly (can cause layout flashes)
  // if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  // if (!user) return null; // Or redirect logic
  // switch (user.role) {
  //     case 'ADMIN': return <AdminDashboard />;
  //     case 'INSTRUCTOR': return <InstructorDashboard />;
  //     case 'LEARNER': return <LearnerDashboard />;
  //     default: return <p>Invalid user role.</p>;
  // }

  // Display loading indicator while waiting for redirect
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-4">Loading your dashboard...</p>
    </div>
  );
}
