import React from "react";
import Link from "next/link";
import { CheckCircle, Circle, PlayCircle, FileText, BookOpen, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LearningPathProgress, LearningPathStep } from "@/lib/types";

interface LearningPathStepsViewProps {
  steps: LearningPathStep[];
  progress?: LearningPathProgress | null;
}

export const LearningPathStepsView: React.FC<LearningPathStepsViewProps> = ({
  steps,
  progress,
}) => {
  const completedStepIds = new Set(progress?.completed_step_ids || []);

  // TODO: Determine the 'current' or 'next' step based on progress
  let nextStepId: string | null = null;
  for (const step of steps) {
    if (!completedStepIds.has(step.id)) {
      nextStepId = step.id;
      break;
    }
  }

  const getStepStatusIcon = (stepId: string) => {
    if (completedStepIds.has(stepId)) {
      return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
    } else if (stepId === nextStepId) {
      return <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />;
    } else {
      return (
        <Circle className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
      );
    }
  };

  const getContentTypeIcon = (typeName: string) => {
    if (typeName === "course")
      return <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />;
    if (typeName === "module")
      return <Layers className="h-4 w-4 mr-2 text-muted-foreground" />; // Example icon
    if (typeName === "text")
      return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
    // Add more icons
    return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />; // Default
  };

  const getStepLink = (step: LearningPathStep): string => {
    // Determine the link based on content type and object slug/id
    const obj = step.content_object?.data;
    if (step.content_type_name === "course" && obj && 'slug' in obj && obj.slug) {
      return `/courses/${obj.slug}`;
    }
    if (step.content_type_name === "module" && obj?.id) {
      // Need course slug for module link? Adjust based on routing
      // Requires knowing the course the module belongs to if linking directly
      // Linking to the first content item of the module might be better
      return "#"; // Placeholder - Needs better routing logic for modules
    }
    // Add links for content items if steps can link directly to them
    return "#"; // Default fallback
  };

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border ml-[9px] z-0"></div>

      <div className="space-y-8 relative z-10">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1 bg-background p-0.5 rounded-full z-10">
                {" "}
                {/* Ensure icon is above line */}
                {getStepStatusIcon(step.id)}
              </div>
              {/* Connector line between items - handled by the main vertical line */}
            </div>
            <Card className="flex-grow -mt-1">
              {" "}
              {/* Offset card slightly */}
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Step {step.order || index + 1}
                    </p>
                    <h4 className="font-semibold flex items-center">
                      {getContentTypeIcon(step.content_type_name ?? "")}
                      {step.content_object?.data?.title || "Untitled Step"}
                    </h4>
                    {!step.is_required && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Optional
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getStepLink(step)}>
                      {completedStepIds.has(step.id) ? "Review" : "Go to Step"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      {steps.length === 0 && (
        <p className="text-muted-foreground">
          This learning path has no steps defined yet.
        </p>
      )}
    </div>
  );
};
