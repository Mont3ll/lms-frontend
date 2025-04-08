"use client";
import React from "react";
// import { useQuery } from '@tanstack/react-query';
// import { fetchCourses } from '@/lib/api'; // Use API function, maybe filter by instructor=me
// import DataTable component (needs creation)
// import { columns } from './_components/columns'; // Define columns for the table
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ManageCoursesPage() {
  // Fetch courses managed by this instructor
  // const { data, isLoading, error } = useQuery(...)

  // Placeholder data
  const data = [
    { id: "1", title: "My Sample Course", status: "Published", students: 25 },
  ];
  const isLoading = false;
  const error = null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Button asChild>
          <Link href="/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      {isLoading && <p>Loading courses...</p>}
      {error && <p className="text-destructive">Error loading courses.</p>}
      {!isLoading && !error && (
        // TODO: Replace with DataTable component
        <div className="border rounded-md p-4">
          <p>Data Table Placeholder - Courses:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
