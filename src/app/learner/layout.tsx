"use client"; // Still client for useAuth hook

import React from "react";
import { Header } from "@/components/layouts/Header";
import { SidebarNav } from "@/components/layouts/SidebarNav";
import { useAuth } from "@/components/providers/AuthProvider";
import Loading from "@/app/loading"; // Import root loading component
import Link from "next/link";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  // Show loading state while auth context resolves user initially
  // Middleware prevents unauthorized access, but context still needs to load user data
  if (isLoading) {
    return <Loading />; // Use the root loading state
  }

  // User should exist if middleware allowed access, but check defensively
  if (!user) {
    // This case ideally shouldn't be reached if middleware is correct
    console.error(
      "LearnerLayout: User not found despite middleware allowing access.",
    );
    // Optional: Redirect to login as a fallback?
    // if (typeof window !== 'undefined') window.location.href = '/login';
    return <p>Error: User session not available.</p>; // Or a more user-friendly error
  }

  // We know user exists and is authorized for this layout (due to middleware)
  // Pass the role to SidebarNav
  const userRole = user.role; // Assuming role is on user object

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 z-40 h-screen w-[220px] lg:w-[280px] border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            {/* Sidebar Header/Logo Area */}
            <Link
              href="/learner/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              {/* <YourLogo className="h-6 w-6" /> */}
              <span className="">LMS Platform</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-4">
            {/* SidebarNav renders its own nav element, don't wrap in another nav */}
            <SidebarNav userRole={userRole} isSuperuser={user.is_superuser} />
          </div>
        </div>
      </div>

      {/* Main Content Area with left margin to account for fixed sidebar */}
      <div className="md:ml-[220px] lg:ml-[280px]">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
