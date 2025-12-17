"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { SidebarNav } from "@/components/layouts/SidebarNav";
import { useAuth } from "@/components/providers/AuthProvider";
import Loading from "@/app/loading";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // All hooks must be called unconditionally at the top level
  useEffect(() => {
    if (!isLoading && !user) {
      // User is not authenticated at all
      router.push("/login");
    } else if (!isLoading && user && user.role !== "ADMIN" && !user.is_staff) {
      // User is authenticated but not authorized for admin
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  // Show loading state while auth context resolves user
  if (isLoading) {
    return <Loading />;
  }

  // Handle unauthorized access more gracefully
  if (!user) {
    // User is not authenticated - redirect handled by useEffect
    return <Loading />;
  }

  if (user.role !== "ADMIN" && !user.is_staff) {
    // User is authenticated but not authorized for admin
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this area.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  const userRole = user.role;
  const isSuperuser = user.is_superuser ?? false;

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-[220px] lg:w-[280px] border-r bg-muted/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            {/* Sidebar Header/Logo Area */}
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              {/* <YourLogo className="h-6 w-6" /> */}
              <span className="">LMS Admin</span> {/* Admin specific title? */}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-4">
            {/* SidebarNav renders its own nav element, don't wrap in another nav */}
            <SidebarNav userRole={userRole} isSuperuser={isSuperuser} />
          </div>
        </div>
      </aside>

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
