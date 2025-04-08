"use client"; // Need client component for useAuth and conditional rendering

import React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { SidebarNav } from "@/components/layouts/SidebarNav";
import { useAuth } from "@/components/providers/AuthProvider"; // Corrected path

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Handle loading state and unauthorized access
  if (isLoading) {
    // Or use the root loading.tsx by default
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user session...</p>
        {/* Add a spinner */}
      </div>
    );
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    // Using router.replace to avoid adding layout load to history
    if (typeof window !== "undefined") {
      // Ensure running client-side
      router.replace("/login");
    }
    return null; // Render nothing while redirecting
  }

  if (
    user.role !== "LEARNER" &&
    user.role !== "ADMIN" &&
    user.role !== "INSTRUCTOR"
  ) {
    // Basic check, adjust as needed
    // Redirect if user role doesn't match expected layout roles
    // Maybe redirect to their appropriate dashboard or show an error
    if (typeof window !== "undefined") {
      router.replace("/unauthorized"); // Or appropriate page
    }
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            {/* Sidebar Header/Logo Area */}
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {/* <Package2 className="h-6 w-6" /> Logo */}
              <span className="">LMS Platform</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {/* Pass user role to SidebarNav */}
              <SidebarNav userRole={user.role} />
            </nav>
          </div>
          {/* Optional Sidebar Footer */}
          {/* <div className="mt-auto p-4"> ... </div> */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <Header /> {/* Include the shared header */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {/* Page content goes here */}
          {children}
        </main>
      </div>
    </div>
  );
}
