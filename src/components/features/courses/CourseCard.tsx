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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/types"; // Import Course type
import { CheckCircle, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course; // Use full Course type with progress_percentage included
}

export function CourseCard({ course }: CourseCardProps) {
  const { slug, title, description, thumbnail, progress_percentage } =
    course;
  const defaultImage = "/file.svg"; // Using an existing SVG to prevent 404

  // Determine completion status
  const isCompleted = progress_percentage === 100;
  const isInProgress = progress_percentage != null && progress_percentage > 0 && progress_percentage < 100;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform hover:scale-105">
      <Link href={`/learner/courses/${slug}`}>
        <CardHeader className="p-0 relative">
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image
              src={thumbnail || defaultImage}
              alt={title || "Course thumbnail"}
              fill // Use fill layout
              style={{ objectFit: "cover" }} // Cover the area
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes
              onError={(e) => {
                // Fallback to default image on error
                (e.target as HTMLImageElement).src = defaultImage;
              }}
            />
            {/* Status Badge Overlay */}
            <div className="absolute top-2 right-2">
              {isCompleted && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isInProgress && (
                <Badge variant="secondary">
                  <BookOpen className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          {" "}
          {/* flex-grow allows content to push footer down */}
          <CardTitle className="text-lg mb-1 hover:text-primary truncate">
            {title || "Untitled Course"}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm">
            {" "}
            {/* Limit description lines */}
            {description || "No description available."}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="p-4 flex flex-col items-start gap-2">
        {/* Progress Bar - Show for all courses with progress data */}
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
            <Progress 
              value={progress_percentage} 
              className={`h-2 ${
                isCompleted 
                  ? '[&>div]:bg-green-600' 
                  : isInProgress 
                    ? '[&>div]:bg-blue-600' 
                    : '[&>div]:bg-gray-400'
              }`} 
            />
          </div>
        )}
        
        {/* Status Text for courses without progress data */}
        {progress_percentage === undefined && (
          <div className="w-full">
            <Badge variant="outline" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Not Started
            </Badge>
          </div>
        )}

        {/* Action Button */}
        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href={`/learner/courses/${slug}`}>
            {isCompleted
              ? "Review Course"
              : isInProgress
                ? "Continue Learning"
                : "Start Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
