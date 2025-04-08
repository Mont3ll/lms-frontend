import React from "react";

// Very simple wrapper, often used within the main public layout
export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full max-w-md">
      {/* Optional: Could add a shared Card wrapper here if desired */}
      {children}
    </div>
  );
};
