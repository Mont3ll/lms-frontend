"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  BarChart3,
  AlertCircle,
  Zap,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

import { fetchMySkillProgress, fetchSkillGaps, fetchLearnerSkillProgress } from "@/lib/api";
import { SkillGapChart } from "@/components/features/skills/SkillGapChart";
import type {
  LearnerSkillSummary,
  LearnerSkillProgress,
  SkillGap,
  SkillCategory,
  SkillProficiencyLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/** Query keys for skill-related queries */
const SKILL_QUERY_KEYS = {
  MY_SKILL_PROGRESS: ["mySkillProgress"],
  SKILL_GAPS: ["skillGaps"],
  LEARNER_SKILL_PROGRESS: ["learnerSkillProgress"],
};

/** Proficiency level labels */
const PROFICIENCY_LABELS: Record<SkillProficiencyLevel, string> = {
  NOVICE: "Novice",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

/** Category labels */
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  TECHNICAL: "Technical",
  SOFT: "Soft Skills",
  DOMAIN: "Domain",
  LANGUAGE: "Language",
  METHODOLOGY: "Methodology",
  TOOL: "Tools",
  OTHER: "Other",
};

/** Category colors */
const CATEGORY_COLORS: Record<SkillCategory, string> = {
  TECHNICAL: "bg-blue-100 text-blue-800 border-blue-200",
  SOFT: "bg-pink-100 text-pink-800 border-pink-200",
  DOMAIN: "bg-purple-100 text-purple-800 border-purple-200",
  LANGUAGE: "bg-green-100 text-green-800 border-green-200",
  METHODOLOGY: "bg-orange-100 text-orange-800 border-orange-200",
  TOOL: "bg-cyan-100 text-cyan-800 border-cyan-200",
  OTHER: "bg-gray-100 text-gray-800 border-gray-200",
};

/** Trend icon component */
const TrendIcon: React.FC<{ trend: "improving" | "stable" | "declining" }> = ({
  trend,
}) => {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

/** Summary stats skeleton */
const SummaryStatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

/** Skill card skeleton */
const SkillCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-2 w-full mt-4" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </CardContent>
  </Card>
);

/** Individual skill progress card */
interface SkillProgressCardProps {
  skill: LearnerSkillProgress;
}

const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skill }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-sm">{skill.skill_name}</h4>
            <Badge
              variant="outline"
              className={cn("mt-1 text-xs", CATEGORY_COLORS[skill.skill_category])}
            >
              {CATEGORY_LABELS[skill.skill_category]}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon trend={skill.progress_trend} />
            <Badge
              variant={
                skill.proficiency_level === "EXPERT" || skill.proficiency_level === "ADVANCED"
                  ? "default"
                  : "secondary"
              }
              className="text-xs"
            >
              {skill.proficiency_level_display}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Proficiency</span>
            <span>{skill.proficiency_score}%</span>
          </div>
          <Progress value={skill.proficiency_score} className="h-2" />
        </div>

        {/* Last activity */}
        {(skill.last_assessed_at || skill.last_practiced_at) && (
          <p className="text-xs text-muted-foreground mt-3">
            Last activity:{" "}
            {new Date(
              skill.last_assessed_at || skill.last_practiced_at || ""
            ).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default function LearnerSkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Fetch skill summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery<LearnerSkillSummary>({
    queryKey: SKILL_QUERY_KEYS.MY_SKILL_PROGRESS,
    queryFn: fetchMySkillProgress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all skill progress records
  const {
    data: skillProgressData,
    isLoading: isProgressLoading,
    error: progressError,
  } = useQuery({
    queryKey: SKILL_QUERY_KEYS.LEARNER_SKILL_PROGRESS,
    queryFn: () => fetchLearnerSkillProgress({ page_size: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch skill gaps
  const {
    data: skillGaps,
    isLoading: isGapsLoading,
    error: gapsError,
  } = useQuery<SkillGap[]>({
    queryKey: SKILL_QUERY_KEYS.SKILL_GAPS,
    queryFn: fetchSkillGaps,
    staleTime: 1000 * 60 * 5,
  });

  const skillProgress = useMemo(() => skillProgressData?.results || [], [skillProgressData?.results]);

  // Filter skills based on selected category and level
  const filteredSkills = useMemo(() => {
    return skillProgress.filter((skill) => {
      const categoryMatch =
        selectedCategory === "all" || skill.skill_category === selectedCategory;
      const levelMatch =
        selectedLevel === "all" || skill.proficiency_level === selectedLevel;
      return categoryMatch && levelMatch;
    });
  }, [skillProgress, selectedCategory, selectedLevel]);

  // Get unique categories from skills
  const availableCategories = useMemo(() => {
    const categories = new Set<SkillCategory>();
    skillProgress.forEach((s) => categories.add(s.skill_category));
    return Array.from(categories);
  }, [skillProgress]);

  // Group skills by category for the overview
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, LearnerSkillProgress[]> = {};
    skillProgress.forEach((skill) => {
      if (!grouped[skill.skill_category]) {
        grouped[skill.skill_category] = [];
      }
      grouped[skill.skill_category].push(skill);
    });
    return grouped;
  }, [skillProgress]);

  const isLoading = isSummaryLoading || isProgressLoading || isGapsLoading;
  const error = summaryError || progressError || gapsError;

  if (error) {
    return (
      <PageWrapper
        title="My Skills"
        description="Track your skill development and identify areas for improvement."
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load skill data. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Skills"
      description="Track your skill development and identify areas for improvement."
    >
      {/* Summary Stats */}
      {isLoading ? (
        <SummaryStatsSkeleton />
      ) : summary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_skills}</div>
              <p className="text-xs text-muted-foreground">
                {summary.skills_in_progress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.skills_mastered}
              </div>
              <p className="text-xs text-muted-foreground">
                Advanced or Expert level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Proficiency</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(summary.average_proficiency)}%
              </div>
              <Progress
                value={summary.average_proficiency}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strongest Area</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">
                {summary.strongest_category
                  ? CATEGORY_LABELS[summary.strongest_category as SkillCategory] ||
                    summary.strongest_category
                  : "N/A"}
              </div>
              {summary.weakest_category && (
                <p className="text-xs text-muted-foreground">
                  Focus on:{" "}
                  {CATEGORY_LABELS[summary.weakest_category as SkillCategory] ||
                    summary.weakest_category}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Recent Improvements */}
      {summary && summary.recent_improvements.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Recent Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {summary.recent_improvements.map((improvement, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2"
                >
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{improvement.skill_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {PROFICIENCY_LABELS[improvement.old_level]} →{" "}
                    <span className="text-green-600 font-medium">
                      {PROFICIENCY_LABELS[improvement.new_level]}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="all-skills" className="mt-6">
        <TabsList>
          <TabsTrigger value="all-skills">All Skills</TabsTrigger>
          <TabsTrigger value="skill-gaps">
            Skill Gaps
            {skillGaps && skillGaps.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {skillGaps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
        </TabsList>

        {/* All Skills Tab */}
        <TabsContent value="all-skills" className="mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="NOVICE">Novice</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkillCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Skills Found</h3>
                <p className="text-muted-foreground mb-4">
                  {skillProgress.length === 0
                    ? "Start learning to track your skill development!"
                    : "No skills match the selected filters."}
                </p>
                {skillProgress.length === 0 && (
                  <Button asChild>
                    <Link href="/learner/catalog">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => (
                <SkillProgressCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Skill Gaps Tab */}
        <TabsContent value="skill-gaps" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : !skillGaps || skillGaps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Skill Gaps!</h3>
                <p className="text-muted-foreground mb-4">
                  Great job! You&apos;re meeting all your target skill levels.
                </p>
                <Button asChild variant="outline">
                  <Link href="/learner/learning-paths">
                    <Target className="mr-2 h-4 w-4" />
                    Set New Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Skill Gap Chart */}
              <SkillGapChart
                skillGaps={skillGaps}
                title="Your Skill Gaps"
                height={Math.min(400, skillGaps.length * 50 + 100)}
              />

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                  <CardDescription>
                    Courses and modules to help close your skill gaps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillGaps.slice(0, 5).map((gap) => (
                      <div
                        key={gap.skill_id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{gap.skill_name}</h4>
                            <Badge variant="destructive" className="text-xs">
                              Gap: {gap.gap_size} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Current: {PROFICIENCY_LABELS[gap.current_level]} →
                            Target: {PROFICIENCY_LABELS[gap.target_level]}
                          </p>
                          {gap.recommended_modules.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {gap.recommended_modules.slice(0, 3).map((mod) => (
                                <Badge
                                  key={mod.module_id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {mod.module_title}
                                </Badge>
                              ))}
                              {gap.recommended_modules.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{gap.recommended_modules.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/learner/learning-paths">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                  {skillGaps.length > 5 && (
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href="/learner/learning-paths">
                        View All Skill Gaps
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="by-category" className="mt-4">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((j) => (
                        <SkillCardSkeleton key={j} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(skillsByCategory).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Skills Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start learning to track your skill development!
                </p>
                <Button asChild>
                  <Link href="/learner/catalog">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Courses
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-sm",
                            CATEGORY_COLORS[category as SkillCategory]
                          )}
                        >
                          {CATEGORY_LABELS[category as SkillCategory] || category}
                        </Badge>
                        <span className="text-muted-foreground font-normal text-sm">
                          ({skills.length} skill{skills.length !== 1 ? "s" : ""})
                        </span>
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Avg:{" "}
                        {Math.round(
                          skills.reduce((sum, s) => sum + s.proficiency_score, 0) /
                            skills.length
                        )}
                        %
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {skills.map((skill) => (
                        <SkillProgressCard key={skill.id} skill={skill} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CTA for generating personalized path */}
      {skillGaps && skillGaps.length > 0 && (
        <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Close Your Skill Gaps Faster
                </h3>
                <p className="text-muted-foreground">
                  Generate a personalized learning path based on your skill gaps.
                </p>
              </div>
              <Button asChild>
                <Link href="/learner/learning-paths/generate">
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Path
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
