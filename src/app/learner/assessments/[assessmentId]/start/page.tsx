import { redirect } from "next/navigation";

export default async function AssessmentStartPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  // Redirect to the attempt page
  redirect(`/learner/assessments/${assessmentId}/attempt`);
}
