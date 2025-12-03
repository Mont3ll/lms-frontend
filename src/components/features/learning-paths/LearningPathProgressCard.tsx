"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Play, Clock } from "lucide-react";
import Link from "next/link";
import { LearningPath, LearningPathProgress } from "@/lib/types";

interface LearningPathProgressCardProps {
  learningPath: LearningPath;
  progress?: LearningPathProgress;
  onEnroll?: (pathId: string) => void;
}

export function LearningPathProgressCard({ 
  learningPath, 
  progress, 
  onEnroll 
}: LearningPathProgressCardProps) {
  const progressPercentage = progress?.progress_percentage || 0;
  const isEnrolled = !!progress;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'PAUSED': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />;
      case 'PAUSED': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{learningPath.title}</CardTitle>
            <CardDescription className="line-clamp-3 mt-2">
              {learningPath.description}
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(progress?.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(progress?.status)}
              {progress?.status ? progress.status.replace('_', ' ') : 'Available'}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        {isEnrolled ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.step_progress?.filter(sp => sp.status === 'COMPLETED').length || 0} of {progress.total_steps} steps
              </span>
              {progress.started_at && (
                <span>
                  Started {new Date(progress.started_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Ready to start this learning path?
            </p>
          </div>
        )}

        {/* Learning Path Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {learningPath.step_count} steps
          </span>
          <Badge variant="outline" className="text-xs">
            {learningPath.status_display}
          </Badge>
        </div>

        {/* Next Step Info */}
        {progress?.current_step_info && (
          <div className="border rounded-lg p-3 bg-muted/50">
            <p className="text-sm font-medium">Next Step:</p>
            <p className="text-sm text-muted-foreground">
              {progress.current_step_info.title}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isEnrolled ? (
            <Button asChild className="flex-1">
              <Link href={`/learner/learning-paths/${learningPath.slug}`}>
                {progress?.status === 'COMPLETED' ? 'Review' : 'Continue'}
              </Link>
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onEnroll?.(learningPath.id)}
              >
                Enroll
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/learner/learning-paths/${learningPath.slug}`}>
                  Preview
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
