import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Left side skeleton */}
      <div className="flex-grow lg:w-2/3 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-3 mt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      {/* Right side skeleton */}
      <aside className="lg:w-1/3 space-y-2">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-60 w-full" />
      </aside>
    </div>
  );
}
