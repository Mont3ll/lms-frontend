import React from "react";

// Simple layout for public pages (login, register, etc.)
// Often centers content on the page.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      {/* Optional: Add Logo or Branding */}
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
