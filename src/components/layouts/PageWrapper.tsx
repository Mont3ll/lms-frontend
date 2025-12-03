import React from "react";
import { cn } from "@/lib/utils"; // Utility for merging class names

interface PageWrapperProps {
  children: React.ReactNode; // The main content of the page
  className?: string; // Optional additional classes for the main container
  title?: string; // Optional page title to display
  description?: string; // Optional description below the title
  actions?: React.ReactNode; // Optional elements to display top-right (e.g., buttons)
}

/**
 * A reusable wrapper component to provide consistent padding, optional heading,
 * and action buttons area for main page content. Typically used inside a main
 * layout component (like AuthenticatedLayout).
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  title,
  description,
  actions,
}) => {
  return (
    // Main container with vertical flex and gap
    <div className={cn("flex flex-col gap-4 lg:gap-6", className)}>
      {/* Header section for Title, Description, and Actions */}
      {(title || description || actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          {/* Title and Description */}
          {(title || description) && (
            <div className="flex-shrink mr-4">
              {" "}
              {/* Prevent title from shrinking too much */}
              {title && (
                <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          {/* Actions Area */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
              {" "}
              {/* Actions on the right */}
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {" "}
        {/* Allow content to take remaining space */}
        {children}
      </div>
    </div>
  );
};
