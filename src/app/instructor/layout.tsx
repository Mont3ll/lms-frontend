"use client"; // Client component for useAuth hook and loading state

import React from "react";
// No need for useRouter for redirection here anymore
import { Header } from "@/components/layouts/Header";
import { SidebarNav } from "@/components/layouts/SidebarNav";
import { useAuth } from "@/components/providers/AuthProvider";
import Loading from "@/app/loading"; // Use root loading component
import Link from "next/link"; // For sidebar header link

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  // Show loading state while auth context resolves user
  if (isLoading) {
    return <Loading />;
  }

  // User should exist and have the correct role (INSTRUCTOR or ADMIN)
  // if middleware allowed access. Add a defensive check.
  if (
    !user ||
    (user.role !== "INSTRUCTOR" && user.role !== "ADMIN" && !user.is_staff)
  ) {
    // This case ideally shouldn't be reached if middleware is correct
    console.error(
      "InstructorLayout: User not found or not authorized despite middleware allowing access.",
    );
    // Could render an error message or redirect as a fallback
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error: Unauthorized Access or Session Issue.
      </div>
    );
  }

  const userRole = user.role;

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-[220px] lg:w-[280px] border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            {/* Sidebar Header/Logo Area */}
            <Link
              href="/instructor/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              {/* <YourLogo className="h-6 w-6" /> */}
              <span className="">LMS Platform</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {" "}
            {/* Add scroll for long nav */}
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              <SidebarNav userRole={userRole} /> {/* Pass role */}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area with left margin to account for fixed sidebar */}
      <div className="md:ml-[220px] lg:ml-[280px]">
        <Header /> {/* Shared header component */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 min-h-screen">
          {children} {/* Page specific content renders here */}
        </main>
      </div>
    </div>
  );
}
