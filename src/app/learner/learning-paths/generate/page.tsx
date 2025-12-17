"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  fetchSkills,
  fetchMyAssessmentAttempts,
  previewPathGeneration,
  generateSkillGapPath,
  generateRemedialPath,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Target,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Zap,
  ChevronRight,
  Info,
} from "lucide-react";
import { PathGenerationWizard } from "@/components/features/skills/PathGenerationWizard";
import { getApiErrorMessage } from "@/lib/api";
import type {
  PathPreviewResponse,
  GeneratePathPreviewRequest,
  SkillListItem,
} from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

type GenerationType = "SKILL_GAP" | "REMEDIAL";

interface GenerationTypeInfo {
  type: GenerationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  disabled?: boolean;
  disabledReason?: string;
}

// =============================================================================
// Constants
// =============================================================================

const getGenerationTypes = (hasGradedAttempts: boolean): GenerationTypeInfo[] => [
  {
    type: "SKILL_GAP",
    title: "Skill Gap Path",
    description:
      "Create a personalized learning path based on skills you want to develop. Select your target skills and we'll generate a customized curriculum.",
    icon: <Target className="h-8 w-8" />,
    features: [
      "Select from available skills in the system",
      "Set duration and module limits",
      "Choose difficulty preference",
      "Option to include completed modules for review",
    ],
  },
  {
    type: "REMEDIAL",
    title: "Remedial Path",
    description:
      "Generate a learning path based on your assessment results. We'll identify areas where you need improvement and create targeted content.",
    icon: <BookOpen className="h-8 w-8" />,
    features: [
      "Based on your assessment performance",
      "Focuses on weak areas identified in assessments",
      "Helps strengthen specific skills",
      "Customizable module limits",
    ],
    disabled: !hasGradedAttempts,
    disabledReason: hasGradedAttempts ? undefined : "No graded assessments available",
  },
];

// =============================================================================
// Sub-components
// =============================================================================

/** Loading skeleton for the page */
const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);

/** Generation type card */
const GenerationTypeCard: React.FC<{
  info: GenerationTypeInfo;
  onSelect: () => void;
}> = ({ info, onSelect }) => (
  <Card
    className={`flex flex-col h-full transition-all ${
      info.disabled
        ? "opacity-60 cursor-not-allowed"
        : "hover:shadow-lg hover:border-primary/50 cursor-pointer"
    }`}
    onClick={info.disabled ? undefined : onSelect}
  >
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary">
          {info.icon}
        </div>
        <div>
          <CardTitle className="text-xl">{info.title}</CardTitle>
          {info.disabled && info.disabledReason && (
            <p className="text-xs text-amber-600 mt-1">{info.disabledReason}</p>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow space-y-4">
      <CardDescription className="text-base">{info.description}</CardDescription>
      <div className="space-y-2">
        <p className="text-sm font-medium">Features:</p>
        <ul className="space-y-1">
          {info.features.map((feature, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
    <div className="p-6 pt-0 mt-auto">
      <Button className="w-full" disabled={info.disabled}>
        <Zap className="mr-2 h-4 w-4" />
        {info.disabled ? "Coming Soon" : "Get Started"}
      </Button>
    </div>
  </Card>
);

/** How it works section */
const HowItWorks: React.FC = () => (
  <Card className="bg-muted/30">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        How It Works
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
            1
          </div>
          <div>
            <p className="font-medium">Choose Type</p>
            <p className="text-sm text-muted-foreground">
              Select the type of learning path that fits your needs
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
            2
          </div>
          <div>
            <p className="font-medium">Configure</p>
            <p className="text-sm text-muted-foreground">
              Select skills, set preferences, and customize your path
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
            3
          </div>
          <div>
            <p className="font-medium">Generate</p>
            <p className="text-sm text-muted-foreground">
              Preview and create your personalized learning journey
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// =============================================================================
// Main Component
// =============================================================================

export default function GeneratePathPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available skills
  const {
    data: skillsData,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useQuery({
    queryKey: [...QUERY_KEYS.SKILLS, { is_active: true, page_size: 200 }],
    queryFn: () => fetchSkills({ is_active: true, page_size: 200 }),
  });

  const availableSkills: SkillListItem[] = skillsData?.results || [];

  // Fetch graded assessment attempts for remedial path generation
  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
  } = useQuery({
    queryKey: [...QUERY_KEYS.MY_ASSESSMENT_ATTEMPTS, { status: "GRADED" }],
    queryFn: () => fetchMyAssessmentAttempts({ status: "GRADED" }),
  });

  const gradedAttempts = attemptsData?.results || [];

  // Compute generation types based on whether user has graded attempts
  const generationTypes = useMemo(
    () => getGenerationTypes(gradedAttempts.length > 0),
    [gradedAttempts.length]
  );

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (request: GeneratePathPreviewRequest) => previewPathGeneration(request),
    onError: (err) => {
      setError(getApiErrorMessage(err));
    },
  });

  // Create path mutation
  const createMutation = useMutation({
    mutationFn: async (preview: PathPreviewResponse) => {
      // Determine which API to call based on generation type
      if (preview.generation_type === "SKILL_GAP") {
        return generateSkillGapPath({
          target_skills: preview.target_skills.map((s) => s.id),
          title: preview.title,
          description: preview.description,
        });
      } else {
        // For remedial, extract the assessment attempt ID from generation_params
        const assessmentAttemptId = preview.generation_params
          .assessment_attempt_id as string;
        return generateRemedialPath({
          assessment_attempt_id: assessmentAttemptId,
          title: preview.title,
          description: preview.description,
        });
      }
    },
    onSuccess: (path) => {
      // Invalidate paths cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERSONALIZED_PATHS });
      // Navigate to the new path
      router.push(`/learner/learning-paths/personalized/${path.id}`);
    },
    onError: (err) => {
      setError(getApiErrorMessage(err));
    },
  });

  // Handle type selection
  const handleTypeSelect = () => {
    setError(null);
    setWizardOpen(true);
  };

  // Handle preview generation
  const handlePreview = async (request: GeneratePathPreviewRequest): Promise<PathPreviewResponse> => {
    setError(null);
    return previewMutation.mutateAsync(request);
  };

  // Handle path creation
  const handleCreate = async (preview: PathPreviewResponse) => {
    await createMutation.mutateAsync(preview);
  };

  // Handle wizard close
  const handleWizardClose = (open: boolean) => {
    setWizardOpen(open);
    if (!open) {
      setError(null);
      previewMutation.reset();
      createMutation.reset();
    }
  };

  if (skillsError) {
    return (
      <PageWrapper
        title="Generate Learning Path"
        description="Create a personalized learning path tailored to your goals."
      >
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Skills</AlertTitle>
          <AlertDescription>
            Failed to load available skills. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Generate Learning Path"
      description="Create a personalized learning path tailored to your goals and skill gaps."
    >
      <div className="space-y-8">
        {/* Back link */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/learner/learning-paths/personalized">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Paths
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Create Your Learning Path</h2>
            <p className="text-muted-foreground">
              Choose a generation method below to create a personalized learning experience.
            </p>
          </div>
        </div>

        {(isLoadingSkills || isLoadingAttempts) ? (
          <PageSkeleton />
        ) : (
          <>
            {/* How it works */}
            <HowItWorks />

            {/* Generation type cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {generationTypes.map((info) => (
                <GenerationTypeCard
                  key={info.type}
                  info={info}
                  onSelect={() => handleTypeSelect()}
                />
              ))}
            </div>

            {/* Skills availability info */}
            {availableSkills.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Skills Available</AlertTitle>
                <AlertDescription>
                  There are currently no skills configured in the system. Please contact your administrator
                  to set up skills before generating a personalized learning path.
                </AlertDescription>
              </Alert>
            )}

            {/* Benefits section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Personalized Learning Paths?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Targeted Learning</p>
                      <p className="text-xs text-muted-foreground">
                        Focus on exactly what you need to learn
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Efficient Progress</p>
                      <p className="text-xs text-muted-foreground">
                        Skip what you already know
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Structured Curriculum</p>
                      <p className="text-xs text-muted-foreground">
                        Content organized in logical order
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">AI-Powered</p>
                      <p className="text-xs text-muted-foreground">
                        Smart recommendations for you
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Path Generation Wizard */}
      <PathGenerationWizard
        open={wizardOpen}
        onOpenChange={handleWizardClose}
        availableSkills={availableSkills}
        assessmentAttempts={gradedAttempts}
        onPreview={handlePreview}
        onCreate={handleCreate}
        isLoadingPreview={previewMutation.isPending}
        isCreating={createMutation.isPending}
        error={error}
      />
    </PageWrapper>
  );
}
