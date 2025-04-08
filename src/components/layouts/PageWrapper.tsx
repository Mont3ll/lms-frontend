import React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string; // Optional page title
  actions?: React.ReactNode; // Optional action buttons (e.g., Create button)
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  title,
  actions,
}) => {
  return (
    <div className={cn("flex flex-col gap-4 lg:gap-6", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && (
            <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
          )}
          {actions && (
            <div className="ml-auto flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {/* Main content area */}
      <div className="flex-1">{children}</div>
    </div>
  );
};
