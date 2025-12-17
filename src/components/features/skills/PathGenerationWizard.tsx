"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SkillListItem,
  PathDifficultyPreference,
  PathPreviewResponse,
  PathPreviewStep,
  GeneratePathPreviewRequest,
  AssessmentAttempt,
} from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

/** Wizard step identifiers */
type WizardStep = "type" | "configure" | "preview" | "confirm";

/** Generation type options */
type GenerationType = "SKILL_GAP" | "REMEDIAL";

/** Wizard form data */
interface WizardFormData {
  generationType: GenerationType | null;
  // Skill gap config
  selectedSkills: string[];
  maxDurationHours: number | null;
  maxModules: number | null;
  difficultyPreference: PathDifficultyPreference;
  includeCompleted: boolean;
  // Remedial config
  assessmentAttemptId: string | null;
  focusWeakAreas: boolean;
}

/** Props for PathGenerationWizard */
interface PathGenerationWizardProps {
  /** Whether the wizard dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Available skills for selection */
  availableSkills: SkillListItem[];
  /** User's assessment attempts (for remedial paths) */
  assessmentAttempts?: AssessmentAttempt[];
  /** Callback to generate preview */
  onPreview: (request: GeneratePathPreviewRequest) => Promise<PathPreviewResponse>;
  /** Callback to create the path */
  onCreate: (preview: PathPreviewResponse) => Promise<void>;
  /** Loading state for preview generation */
  isLoadingPreview?: boolean;
  /** Loading state for path creation */
  isCreating?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const STEPS: WizardStep[] = ["type", "configure", "preview", "confirm"];

const STEP_LABELS: Record<WizardStep, string> = {
  type: "Choose Type",
  configure: "Configure",
  preview: "Preview",
  confirm: "Confirm",
};

const DIFFICULTY_OPTIONS: { value: PathDifficultyPreference; label: string }[] = [
  { value: "ANY", label: "Any Difficulty" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const GENERATION_TYPE_INFO: Record<
  GenerationType,
  { title: string; description: string; icon: React.ReactNode }
> = {
  SKILL_GAP: {
    title: "Skill Gap Path",
    description:
      "Generate a learning path based on skills you want to develop. Select target skills and we'll create a personalized path to help you reach your goals.",
    icon: <Target className="h-8 w-8" />,
  },
  REMEDIAL: {
    title: "Remedial Path",
    description:
      "Generate a learning path based on assessment results. We'll identify areas where you need improvement and create a path to strengthen those skills.",
    icon: <BookOpen className="h-8 w-8" />,
  },
};

const DEFAULT_FORM_DATA: WizardFormData = {
  generationType: null,
  selectedSkills: [],
  maxDurationHours: null,
  maxModules: null,
  difficultyPreference: "ANY",
  includeCompleted: false,
  assessmentAttemptId: null,
  focusWeakAreas: true,
};

// =============================================================================
// Helper Functions
// =============================================================================

/** Format duration in hours to readable string */
const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hr${hours >= 2 ? "s" : ""}`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
};

// =============================================================================
// Sub-components
// =============================================================================

/** Step indicator component */
const StepIndicator: React.FC<{
  steps: WizardStep[];
  currentStep: WizardStep;
}> = ({ steps, currentStep }) => {
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-1.5" />
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step === currentStep;
          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                isCurrent && "text-primary font-medium",
                isComplete && "text-muted-foreground",
                !isCurrent && !isComplete && "text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px]",
                  isCurrent && "bg-primary text-primary-foreground",
                  isComplete && "bg-primary/20 text-primary",
                  !isCurrent && !isComplete && "bg-muted"
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Type selection step */
const TypeSelectionStep: React.FC<{
  selectedType: GenerationType | null;
  onSelect: (type: GenerationType) => void;
  hasAssessmentAttempts: boolean;
}> = ({ selectedType, onSelect, hasAssessmentAttempts }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose the type of personalized learning path you want to create:
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.entries(GENERATION_TYPE_INFO) as [GenerationType, typeof GENERATION_TYPE_INFO.SKILL_GAP][]).map(
          ([type, info]) => {
            const isDisabled = type === "REMEDIAL" && !hasAssessmentAttempts;
            return (
              <Card
                key={type}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedType === type && "ring-2 ring-primary",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isDisabled && onSelect(type)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        selectedType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {info.icon}
                    </div>
                    <CardTitle className="text-base">{info.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                  {isDisabled && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      No assessment attempts available
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
};

/** Skill selection component */
const SkillSelector: React.FC<{
  skills: SkillListItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}> = ({ skills, selectedIds, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const query = searchQuery.toLowerCase();
    return skills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) ||
        skill.category_display.toLowerCase().includes(query)
    );
  }, [skills, searchQuery]);

  const groupedSkills = useMemo(() => {
    const groups: Record<string, SkillListItem[]> = {};
    filteredSkills.forEach((skill) => {
      const category = skill.category_display;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
    });
    return groups;
  }, [filteredSkills]);

  const toggleSkill = (skillId: string) => {
    if (selectedIds.includes(skillId)) {
      onChange(selectedIds.filter((id) => id !== skillId));
    } else {
      onChange([...selectedIds, skillId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[250px] border rounded-md p-3">
        {Object.entries(groupedSkills).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills found
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={selectedIds.includes(skill.id) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                      {selectedIds.includes(skill.id) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} skill{selectedIds.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};

/** Configuration step for skill gap path */
const SkillGapConfigStep: React.FC<{
  formData: WizardFormData;
  availableSkills: SkillListItem[];
  onUpdate: (updates: Partial<WizardFormData>) => void;
}> = ({ formData, availableSkills, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Skill Selection */}
      <div className="space-y-2">
        <Label>Target Skills *</Label>
        <SkillSelector
          skills={availableSkills}
          selectedIds={formData.selectedSkills}
          onChange={(ids) => onUpdate({ selectedSkills: ids })}
        />
      </div>

      {/* Duration & Module Limits */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxDuration">Max Duration (hours)</Label>
          <Input
            id="maxDuration"
            type="number"
            min={1}
            placeholder="No limit"
            value={formData.maxDurationHours ?? ""}
            onChange={(e) =>
              onUpdate({
                maxDurationHours: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxModules">Max Modules</Label>
          <Input
            id="maxModules"
            type="number"
            min={1}
            placeholder="No limit"
            value={formData.maxModules ?? ""}
            onChange={(e) =>
              onUpdate({
                maxModules: e.target.value ? parseInt(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      {/* Difficulty Preference */}
      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty Preference</Label>
        <Select
          value={formData.difficultyPreference}
          onValueChange={(value: PathDifficultyPreference) =>
            onUpdate({ difficultyPreference: value })
          }
        >
          <SelectTrigger id="difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Include Completed */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeCompleted"
          checked={formData.includeCompleted}
          onCheckedChange={(checked) =>
            onUpdate({ includeCompleted: checked === true })
          }
        />
        <Label htmlFor="includeCompleted" className="text-sm font-normal">
          Include already completed modules
        </Label>
      </div>
    </div>
  );
};

/** Configuration step for remedial path */
const RemedialConfigStep: React.FC<{
  formData: WizardFormData;
  assessmentAttempts: AssessmentAttempt[];
  onUpdate: (updates: Partial<WizardFormData>) => void;
}> = ({ formData, assessmentAttempts, onUpdate }) => {
  const gradedAttempts = assessmentAttempts.filter(
    (attempt) => attempt.status === "GRADED"
  );

  return (
    <div className="space-y-6">
      {/* Assessment Selection */}
      <div className="space-y-2">
        <Label htmlFor="assessment">Select Assessment *</Label>
        <Select
          value={formData.assessmentAttemptId ?? ""}
          onValueChange={(value) => onUpdate({ assessmentAttemptId: value })}
        >
          <SelectTrigger id="assessment">
            <SelectValue placeholder="Select an assessment attempt" />
          </SelectTrigger>
          <SelectContent>
            {gradedAttempts.map((attempt) => (
              <SelectItem key={attempt.id} value={attempt.id}>
                <div className="flex flex-col">
                  <span>{attempt.assessment_title}</span>
                  <span className="text-xs text-muted-foreground">
                    Score: {attempt.score}/{attempt.max_score} (
                    {new Date(attempt.start_time).toLocaleDateString()})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {gradedAttempts.length === 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No graded assessments found
          </p>
        )}
      </div>

      {/* Max Modules */}
      <div className="space-y-2">
        <Label htmlFor="maxModulesRemedial">Max Modules</Label>
        <Input
          id="maxModulesRemedial"
          type="number"
          min={1}
          placeholder="No limit"
          value={formData.maxModules ?? ""}
          onChange={(e) =>
            onUpdate({
              maxModules: e.target.value ? parseInt(e.target.value) : null,
            })
          }
        />
      </div>

      {/* Focus Weak Areas */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="focusWeakAreas"
          checked={formData.focusWeakAreas}
          onCheckedChange={(checked) =>
            onUpdate({ focusWeakAreas: checked === true })
          }
        />
        <Label htmlFor="focusWeakAreas" className="text-sm font-normal">
          Focus on weak areas identified in the assessment
        </Label>
      </div>
    </div>
  );
};

/** Preview step component */
const PreviewStep: React.FC<{
  preview: PathPreviewResponse | null;
  isLoading: boolean;
  error: string | null;
}> = ({ preview, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Generating path preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm text-destructive mb-2">Failed to generate preview</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No preview available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Path Summary */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h4 className="font-semibold mb-1">{preview.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{preview.description}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {preview.total_steps} module{preview.total_steps !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(preview.estimated_duration)}
          </span>
        </div>
      </div>

      {/* Target Skills */}
      {preview.target_skills.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Target Skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {preview.target_skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Path Steps */}
      <div>
        <p className="text-sm font-medium mb-2">Learning Modules:</p>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-3">
            {preview.steps.map((step, index) => (
              <PreviewStepCard key={step.module_id} step={step} index={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

/** Preview step card */
const PreviewStepCard: React.FC<{
  step: PathPreviewStep;
  index: number;
}> = ({ step, index }) => {
  return (
    <div className="flex gap-3 p-3 border rounded-lg">
      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{step.module_title}</p>
        <p className="text-xs text-muted-foreground truncate">{step.course_title}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(step.estimated_duration)}
          </span>
          {step.is_required && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Required
            </Badge>
          )}
        </div>
        {step.skills_addressed.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {step.skills_addressed.slice(0, 3).map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {skill.name}
              </Badge>
            ))}
            {step.skills_addressed.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{step.skills_addressed.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Confirmation step */
const ConfirmStep: React.FC<{
  preview: PathPreviewResponse | null;
  isCreating: boolean;
}> = ({ preview, isCreating }) => {
  if (!preview) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
        <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-200">
            Ready to create your learning path
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Click &ldquo;Create Path&rdquo; to save and start learning
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{preview.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{preview.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              {preview.total_steps} modules
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatDuration(preview.estimated_duration)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              {preview.target_skills.length} target skills
            </span>
          </div>
        </CardContent>
      </Card>

      {isCreating && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating your learning path...
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

/**
 * PathGenerationWizard - Multi-step wizard for creating personalized learning paths.
 *
 * Guides users through:
 * 1. Selecting path type (Skill Gap or Remedial)
 * 2. Configuring path parameters
 * 3. Previewing the generated path
 * 4. Confirming and creating the path
 */
export const PathGenerationWizard: React.FC<PathGenerationWizardProps> = ({
  open,
  onOpenChange,
  availableSkills,
  assessmentAttempts = [],
  onPreview,
  onCreate,
  isLoadingPreview = false,
  isCreating = false,
  error = null,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("type");
  const [formData, setFormData] = useState<WizardFormData>(DEFAULT_FORM_DATA);
  const [preview, setPreview] = useState<PathPreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const currentStepIndex = STEPS.indexOf(currentStep);

  // Reset wizard when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep("type");
      setFormData(DEFAULT_FORM_DATA);
      setPreview(null);
      setPreviewError(null);
    }
    onOpenChange(open);
  };

  // Update form data
  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Check if current step is valid
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case "type":
        return formData.generationType !== null;
      case "configure":
        if (formData.generationType === "SKILL_GAP") {
          return formData.selectedSkills.length > 0;
        }
        if (formData.generationType === "REMEDIAL") {
          return formData.assessmentAttemptId !== null;
        }
        return false;
      case "preview":
        return preview !== null && previewError === null;
      case "confirm":
        return preview !== null;
      default:
        return false;
    }
  }, [currentStep, formData, preview, previewError]);

  // Handle next step
  const handleNext = async () => {
    if (currentStep === "configure") {
      // Generate preview when moving from configure to preview
      setPreviewError(null);
      const request: GeneratePathPreviewRequest = {
        generation_type: formData.generationType!,
        ...(formData.generationType === "SKILL_GAP"
          ? {
              target_skills: formData.selectedSkills,
              max_duration_hours: formData.maxDurationHours ?? undefined,
              max_modules: formData.maxModules ?? undefined,
              difficulty_preference: formData.difficultyPreference,
              include_completed: formData.includeCompleted,
            }
          : {
              assessment_attempt_id: formData.assessmentAttemptId!,
              focus_weak_areas: formData.focusWeakAreas,
              max_modules: formData.maxModules ?? undefined,
            }),
      };

      try {
        const result = await onPreview(request);
        setPreview(result);
        setCurrentStep("preview");
      } catch (err) {
        setPreviewError(err instanceof Error ? err.message : "Failed to generate preview");
      }
    } else if (currentStep === "confirm") {
      // Create the path
      if (preview) {
        await onCreate(preview);
        handleOpenChange(false);
      }
    } else {
      // Move to next step
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex]);
      }
    }
  };

  // Handle previous step
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  // Get button labels
  const getNextButtonLabel = () => {
    if (currentStep === "configure") return "Generate Preview";
    if (currentStep === "confirm") return "Create Path";
    return "Next";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("sm:max-w-[600px]", className)}>
        <DialogHeader>
          <DialogTitle>Create Personalized Learning Path</DialogTitle>
          <DialogDescription>
            Follow the steps below to create a customized learning path tailored to your
            needs.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="py-4 min-h-[300px]">
          {currentStep === "type" && (
            <TypeSelectionStep
              selectedType={formData.generationType}
              onSelect={(type) => updateFormData({ generationType: type })}
              hasAssessmentAttempts={assessmentAttempts.length > 0}
            />
          )}

          {currentStep === "configure" && formData.generationType === "SKILL_GAP" && (
            <SkillGapConfigStep
              formData={formData}
              availableSkills={availableSkills}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === "configure" && formData.generationType === "REMEDIAL" && (
            <RemedialConfigStep
              formData={formData}
              assessmentAttempts={assessmentAttempts}
              onUpdate={updateFormData}
            />
          )}

          {currentStep === "preview" && (
            <PreviewStep
              preview={preview}
              isLoading={isLoadingPreview}
              error={previewError || error}
            />
          )}

          {currentStep === "confirm" && (
            <ConfirmStep preview={preview} isCreating={isCreating} />
          )}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoadingPreview || isCreating}
                className="flex-1 sm:flex-initial"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <Button
            onClick={handleNext}
            disabled={!isStepValid || isLoadingPreview || isCreating}
            className="flex-1 sm:flex-initial"
          >
            {isLoadingPreview || isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {getNextButtonLabel()}
            {currentStep !== "confirm" && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PathGenerationWizard;
