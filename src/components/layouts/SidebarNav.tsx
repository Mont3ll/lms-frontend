"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react"; // Import specific icons

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
// Import specific icons you need:
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CheckSquare,
  Settings,
  Users,
} from "lucide-react";

interface NavItem {
  href: string;
  title: string;
  icon: LucideIcon;
  roles?: ("ADMIN" | "INSTRUCTOR" | "LEARNER")[]; // Optional: roles that see this link
}

// Define navigation items based on roles
const navItems: NavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    roles: ["LEARNER", "INSTRUCTOR", "ADMIN"],
  },
  { href: "/courses", title: "My Courses", icon: BookOpen, roles: ["LEARNER"] },
  {
    href: "/courses",
    title: "Manage Courses",
    icon: BookOpen,
    roles: ["INSTRUCTOR", "ADMIN"],
  }, // Different label/intent based on role
  {
    href: "/assessments",
    title: "Assessments",
    icon: CheckSquare,
    roles: ["LEARNER", "INSTRUCTOR", "ADMIN"],
  }, // Adjust path based on role view
  {
    href: "/certificates",
    title: "Certificates",
    icon: GraduationCap,
    roles: ["LEARNER"],
  },
  // Instructor/Admin specific links
  { href: "/users", title: "Manage Users", icon: Users, roles: ["ADMIN"] }, // Example Admin link
  {
    href: "/reports",
    title: "Reports",
    icon: LayoutDashboard,
    roles: ["INSTRUCTOR", "ADMIN"],
  }, // Example Instructor/Admin link
  { href: "/settings", title: "Settings", icon: Settings, roles: ["ADMIN"] }, // Example Admin link
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  userRole: "ADMIN" | "INSTRUCTOR" | "LEARNER"; // Pass the current user's role
}

export function SidebarNav({ className, userRole, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  // Unique keys for rendering (handle duplicate hrefs with different titles)
  const uniqueNavItems = filteredNavItems.reduce((acc, current) => {
    const key = `${current.href}-${current.title}`; // Make key unique
    if (!acc.find((item) => `${item.href}-${item.title}` === key)) {
      acc.push(current);
    }
    return acc;
  }, [] as NavItem[]);

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {uniqueNavItems.map((item) => (
        <Link
          key={`${item.href}-${item.title}`} // Use unique key
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href || pathname.startsWith(item.href + "/") // Basic active check
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start", // Align items left
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
