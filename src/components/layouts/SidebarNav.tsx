"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react"; // Import LucideIcon type

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
// Import specific icons you need:
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CheckSquare,
  Settings,
  Users,
  FolderKanban, // For Learning Paths
  FileText, // For Reports (alternative)
  BarChartBig, // For Analytics
  Building, // For Tenants
  Target, // For Skills
  Search, // For Course Catalog
  Bell, // For Notifications
} from "lucide-react";

interface NavItem {
  href: string;
  title: string;
  icon: LucideIcon;
  roles: ("ADMIN" | "INSTRUCTOR" | "LEARNER")[]; // Valid backend roles
  requiresSuperuser?: boolean; // If true, only show to superusers
  // Optional: Add a 'matchPaths' array for more complex active state highlighting
  // matchPaths?: string[];
}

// Define navigation items with CORRECTED hrefs for the new structure
const navItems: NavItem[] = [
  // --- Common ---
  {
    href: "/dashboard", // Generic dashboard, middleware will redirect
    title: "Dashboard",
    icon: LayoutDashboard,
    roles: ["LEARNER", "INSTRUCTOR", "ADMIN"],
  },
  {
    href: "/notifications", // View all notifications
    title: "Notifications",
    icon: Bell,
    roles: ["LEARNER", "INSTRUCTOR", "ADMIN"],
  },

  // --- Learner Specific ---
  {
    href: "/learner/courses", // Path for learner's courses
    title: "My Courses",
    icon: BookOpen,
    roles: ["LEARNER"],
  },
  {
    href: "/learner/catalog", // Browse available courses
    title: "Browse Courses",
    icon: Search,
    roles: ["LEARNER"],
  },
  {
    href: "/learner/assessments", // Generic path, specific attempts linked from course view
    title: "My Assessments",
    icon: CheckSquare,
    roles: ["LEARNER"],
  },
  {
    href: "/learner/certificates",
    title: "My Certificates",
    icon: GraduationCap,
    roles: ["LEARNER"],
  },
  {
    href: "/learner/learning-paths",
    title: "Learning Paths",
    icon: FolderKanban,
    roles: ["LEARNER"],
  },
  {
    href: "/learner/skills",
    title: "Skills",
    icon: Target,
    roles: ["LEARNER"],
  },

  // --- Instructor Specific ---
  {
    href: "/instructor/courses", // Path for instructor's course management
    title: "Manage Courses",
    icon: BookOpen,
    roles: ["INSTRUCTOR"],
  },
  {
    href: "/instructor/assessments",
    title: "Manage Assessments",
    icon: CheckSquare,
    roles: ["INSTRUCTOR"],
  },
  {
    href: "/instructor/analytics",
    title: "Analytics",
    icon: BarChartBig,
    roles: ["INSTRUCTOR"],
  },
  {
    href: "/instructor/reports", // Instructor-specific reports
    title: "Course Reports",
    icon: FileText,
    roles: ["INSTRUCTOR"],
  },
  {
    href: "/instructor/learning-paths",
    title: "Learning Paths",
    icon: FolderKanban,
    roles: ["INSTRUCTOR"],
  },

  // --- Admin Specific ---
  // Admin can see everything, but provide direct links to admin sections
  {
    href: "/admin/tenants",
    title: "Manage Tenants",
    icon: Building,
    roles: ["ADMIN"],
    requiresSuperuser: true, // Only superusers can manage tenants
  },
  {
    href: "/admin/users",
    title: "Manage Users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/courses", // Admin view of all platform courses
    title: "All Courses (Admin)",
    icon: BookOpen,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/skills", // Admin skill management
    title: "Manage Skills",
    icon: Target,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/settings", // Root for platform settings
    title: "Platform Settings",
    icon: Settings,
    roles: ["ADMIN"],
    requiresSuperuser: true, // Only superusers can access platform settings
  },
  // Specific settings sub-pages can be added if direct nav is desired
  // { href: "/admin/settings/models", title: "AI Models", icon: Cpu, roles: ["ADMIN"] },
  // { href: "/admin/settings/prompts", title: "AI Prompts", icon: Cpu, roles: ["ADMIN"] },
  {
    href: "/admin/analytics",
    title: "Platform Analytics",
    icon: BarChartBig,
    roles: ["ADMIN"],
  },
  // Add a general "Help/Support" or "Documentation" link if applicable
  // { href: "/help", title: "Help & Support", icon: LifeBuoy, roles: ["LEARNER", "INSTRUCTOR", "ADMIN"] },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  userRole: "ADMIN" | "INSTRUCTOR" | "LEARNER";
  isSuperuser?: boolean;
}

export function SidebarNav({ className, userRole, isSuperuser = false, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  // Filter items based on the current user's role and superuser status
  const filteredNavItems = navItems.filter(
    (item) => {
      // First check role
      if (!item.roles.includes(userRole)) return false;
      // Then check superuser requirement
      if (item.requiresSuperuser && !isSuperuser) return false;
      return true;
    }
  );

  // The previous reduce logic for uniqueness might not be strictly necessary anymore
  // if the hrefs are now more specific due to role-based paths.
  // However, if an ADMIN has items that overlap with INSTRUCTOR exactly (same href, same title for a different purpose),
  // you might still need it or adjust the navItems definition.
  // For now, let's assume distinct enough items after role filtering.
  const uniqueNavItems = filteredNavItems.reduce((acc, current) => {
    // Make key more specific if admin might have same link as instructor but slightly different context
    // For now, title and href should be distinct enough PER ROLE after filtering
    const existing = acc.find(item => item.href === current.href && item.title === current.title);
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, [] as NavItem[]);


  return (
    <nav
      className={cn(
        "flex flex-col space-y-1", // Keep as flex-col, space-x removed
        className
      )}
      {...props}
    >
      {uniqueNavItems.map((item) => {
        // More robust active state check:
        // 1. Exact match
        // 2. Pathname starts with item.href (for nested routes), ensuring it's followed by a '/' or is an exact match.
        const isActive = pathname === item.href ||
          (pathname.startsWith(item.href) && pathname.charAt(item.href.length) === '/') ||
          (item.href === '/dashboard' && pathname.startsWith(`/${userRole.toLowerCase()}/dashboard`)); // Special case for generic dashboard


        return (
          <Link
            key={`${item.href}-${item.title}`} // Unique key
            href={item.href} // Use the corrected href
            className={cn(
              buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }), // Use secondary for active
              "w-full justify-start", // Align items left
              isActive && "font-semibold"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
