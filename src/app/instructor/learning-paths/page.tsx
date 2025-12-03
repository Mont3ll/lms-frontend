import React from "react";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

// Placeholder for API call
const fetchLearningPaths = async () => {
  // TODO: Replace with real API call
  return [
    { slug: "python-programming", title: "Python Programming Journey", steps: 2 },
    { slug: "data-science", title: "Data Science Pathway", steps: 3 },
  ];
};

export default async function InstructorLearningPathsPage() {
  const learningPaths = await fetchLearningPaths();

  return (
    <PageWrapper
      title="Learning Paths"
      description="Create and curate learning journeys by combining courses and modules."
      actions={
        <Link href="/instructor/learning-paths/new" className="btn btn-primary">
          + New Learning Path
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No learning paths yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get started by creating a new learning path.</p>
            </CardContent>
          </Card>
        ) : (
          learningPaths.map((path) => (
            <Card key={path.slug}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  {path.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{path.steps} steps</span>
                <Link href={`/instructor/learning-paths/${path.slug}`} className="btn btn-sm btn-outline w-full mt-2">
                  Edit
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageWrapper>
  );
}
