"use client";
import React from "react";
import { Header } from "./Header";
import { SidebarNav } from "./SidebarNav";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    /* ... loading UI ... */
  }
  if (!user) {
    /* ... redirect logic ... */ return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              {/* <YourLogoComponent /> */}
              <span className="">LMS Platform</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
              {user && <SidebarNav userRole={user.role} />}
            </nav>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
