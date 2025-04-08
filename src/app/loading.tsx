import { Skeleton } from "@/components/ui/skeleton"; // Or use a custom spinner

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  // This will be shown while the root layout/page loads.
  // A simple spinner or minimal skeleton might be best here.
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Example using Skeleton for a simple centered box */}
      <Skeleton className="h-12 w-12 rounded-full" />
      {/* Or just text: <p>Loading...</p> */}
    </div>
  );
}
