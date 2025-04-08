import Link from "next/link";
import Image from "next/image"; // For course thumbnails
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Progress } from '@/components/ui/progress'; // Shadcn progress
import { Course } from "@/lib/types"; // Import Course type

interface CourseCardProps {
  course: Partial<Course> & { progress_percentage?: number }; // Allow partial Course for list view, add progress
}

export function CourseCard({ course }: CourseCardProps) {
  const { slug, title, description, thumbnail_url, progress_percentage } =
    course;
  const defaultImage = "/images/placeholder-course.png"; // Provide a default placeholder

  return (
    <Card className="flex flex-col h-full">
      {" "}
      {/* Ensure cards take full height in grid */}
      <CardHeader className="p-0">
        <Link href={`/courses/${slug}`}>
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image
              src={thumbnail_url || defaultImage}
              alt={title || "Course thumbnail"}
              fill // Use fill layout
              style={{ objectFit: "cover" }} // Cover the area
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {" "}
        {/* flex-grow allows content to push footer down */}
        <CardTitle className="text-lg mb-1 hover:text-primary">
          <Link href={`/courses/${slug}`}>{title || "Untitled Course"}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {" "}
          {/* Limit description lines */}
          {description || "No description available."}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-2">
        {/* Progress Bar */}
        {progress_percentage !== undefined && (
          <div className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-xs font-medium">
                {progress_percentage}%
              </span>
            </div>
            {/* <Progress value={progress_percentage} className="h-2" /> */}
            <div className="h-2 w-full bg-secondary rounded-full">
              <div
                className="h-2 bg-primary rounded-full"
                style={{ width: `${progress_percentage}%` }}
              />
            </div>
          </div>
        )}
        {/* Action Button */}
        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href={`/courses/${slug}`}>
            {progress_percentage !== undefined && progress_percentage > 0
              ? "Continue Learning"
              : "View Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
