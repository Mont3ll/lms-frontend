import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListOrdered } from "lucide-react"; // Example icons

interface LearningPathProgress {
  completed_step_ids?: string[];
  status?: string;
}

interface LearningPath {
  slug: string;
  title: string;
  description?: string;
  step_count?: number;
}

interface LearningPathCardProps {
  learningPath: LearningPath;
  progress?: LearningPathProgress;
}

export const LearningPathCard: React.FC<LearningPathCardProps> = ({
  learningPath,
  progress,
}) => {
  const totalSteps = learningPath.step_count || 0;
  // TODO: Calculate completed steps based on progress object structure
  const completedSteps = progress?.completed_step_ids?.length || 0;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isCompleted =
    progress?.status === "completed" || progressPercent === 100;

  return (
    <Card className="flex flex-col h-full">
      {/* Optional Thumbnail */}
      {/* {learningPath.thumbnail_url && ... } */}
      <CardHeader>
        <CardTitle className="text-lg hover:text-primary">
          <Link href={`/learning-paths/${learningPath.slug}`}>
            {learningPath.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {learningPath.description || "No description available."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <ListOrdered className="h-4 w-4 mr-2" /> {totalSteps} Steps
        </div>
        {/* Progress indicator */}
        {progress && (
          <div className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-xs font-medium">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full">
              <div
                className="h-2 bg-primary rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="default" size="sm" asChild>
          <Link href={`/learning-paths/${learningPath.slug}`}>
            {isCompleted
              ? "View Path"
              : progress
                ? "Continue Path"
                : "Start Path"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
