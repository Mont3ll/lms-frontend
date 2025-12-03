"use client";

import Link from "next/link";
import { CircleUser, Bell, Menu } from "lucide-react"; // Import icons

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // For mobile nav
import { useAuth } from "@/components/providers/AuthProvider";
import { ModeToggle } from "@/components/ui/mode-toggle"; // Assuming you create this based on shadcn docs
import { SidebarNav } from "./SidebarNav"; // Import SidebarNav for mobile sheet

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      {/* Mobile Navigation */}
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard" // Link to home/dashboard
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          {/* <Package2 className="h-6 w-6" /> Replace with your logo */}
          <span className="">LMS Platform</span> {/* Replace with logo/name */}
        </Link>
        {/* Optional: Add top-level nav links here if not using sidebar exclusively */}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          {/* Render SidebarNav inside the mobile sheet */}
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              {/* <Package2 className="h-6 w-6" /> Logo */}
              <span className="">LMS Platform</span>
            </Link>
            {user && (
              <SidebarNav userRole={user.role} className="flex-col space-y-1" />
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Header Right Section */}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          {/* Optional: Search Bar */}
          {/* <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div> */}
        </form>
        <ModeToggle /> {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" /> {/* Placeholder for notifications */}
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            {/* Add settings etc. based on role */}
            {user?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/settings">Admin Settings</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
