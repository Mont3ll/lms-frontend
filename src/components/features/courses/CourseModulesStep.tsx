import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import ModuleManager if interaction is needed here, or just show message
// import { ModuleManager } from './ModuleManager';

export const CourseModulesStep = () => {
  // This step might just be informational in a simple multi-step process,
  // directing the user to manage modules *after* the course is created.
  // Or, it could embed the ModuleManager, but that makes the form state complex.
  // Let's assume it's informational for now.

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content (Step 2/3)</CardTitle>
        <CardDescription>
          You can add modules and content items to your course after saving
          these initial details. Modules organize your course content into
          logical sections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Proceed to the next step to configure publishing options, or save now
          and manage content later from the course edit page.
        </p>
        {/* Optionally, if creating/editing modules here: */}
        {/* <ModuleManager initialModules={[]} onSave={() => {}} /> */}
      </CardContent>
    </Card>
  );
};
