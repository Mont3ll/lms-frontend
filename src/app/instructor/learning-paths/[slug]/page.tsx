import React from "react";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

// Placeholder for API call
const fetchLearningPath = async (slug: string) => {
  // TODO: Replace with real API call
  return {
    slug,
    title: "Python Programming Journey",
    description: "A curated path to master Python.",
    steps: [
      { id: 1, title: "Intro to Python", type: "Course" },
      { id: 2, title: "Advanced Python", type: "Course" },
    ],
  };
};

export default async function EditLearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await fetchLearningPath(slug);

  return (
    <PageWrapper
      title={path.title}
      description={path.description}
      actions={
        <Link href="/instructor/learning-paths" className="btn btn-outline">
          Back to List
        </Link>
      }
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">{path.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block font-medium mb-1">Title</label>
            <input type="text" value={path.title} className="input input-bordered w-full" readOnly />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea value={path.description} className="input input-bordered w-full min-h-[60px]" readOnly />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {path.steps.map((step) => (
              <li key={step.id} className="py-3 flex items-center justify-between">
                <span>{step.title} <span className="text-xs text-muted-foreground">({step.type})</span></span>
                <button className="btn btn-sm btn-error">Remove</button>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary mt-4 w-full">+ Add Course or Module</button>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
