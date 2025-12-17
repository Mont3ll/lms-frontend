"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  SkillCategory,
  SkillProficiencyLevel,
  ModuleSkillContributionLevel,
} from "@/lib/types";

/** Props for the SkillBadge component */
interface SkillBadgeProps {
  /** Skill name to display */
  name: string;
  /** Skill category */
  category?: SkillCategory;
  /** Current proficiency level */
  proficiencyLevel?: SkillProficiencyLevel;
  /** Module contribution level (for module-skill mappings) */
  contributionLevel?: ModuleSkillContributionLevel;
  /** Whether this is a primary skill */
  isPrimary?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the category indicator */
  showCategory?: boolean;
  /** Whether to show proficiency/contribution level */
  showLevel?: boolean;
  /** Whether the badge is clickable */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
}

/** Get background color based on skill category */
const getCategoryColor = (category?: SkillCategory): string => {
  switch (category) {
    case "TECHNICAL":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "SOFT":
      return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800";
    case "DOMAIN":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "LANGUAGE":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "METHODOLOGY":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case "TOOL":
      return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700";
  }
};

/** Get proficiency level display info */
const getProficiencyInfo = (
  level?: SkillProficiencyLevel
): { label: string; color: string } => {
  switch (level) {
    case "NOVICE":
      return { label: "Novice", color: "text-gray-500" };
    case "BEGINNER":
      return { label: "Beginner", color: "text-yellow-600" };
    case "INTERMEDIATE":
      return { label: "Intermediate", color: "text-blue-600" };
    case "ADVANCED":
      return { label: "Advanced", color: "text-purple-600" };
    case "EXPERT":
      return { label: "Expert", color: "text-green-600" };
    default:
      return { label: "", color: "" };
  }
};

/** Get contribution level display info */
const getContributionInfo = (
  level?: ModuleSkillContributionLevel
): { label: string; icon: string } => {
  switch (level) {
    case "INTRODUCES":
      return { label: "Introduces", icon: "+" };
    case "DEVELOPS":
      return { label: "Develops", icon: "++" };
    case "REINFORCES":
      return { label: "Reinforces", icon: "+++" };
    case "MASTERS":
      return { label: "Masters", icon: "++++" };
    default:
      return { label: "", icon: "" };
  }
};

/** Get category short label */
const getCategoryLabel = (category?: SkillCategory): string => {
  switch (category) {
    case "TECHNICAL":
      return "Tech";
    case "SOFT":
      return "Soft";
    case "DOMAIN":
      return "Domain";
    case "LANGUAGE":
      return "Lang";
    case "METHODOLOGY":
      return "Method";
    case "TOOL":
      return "Tool";
    default:
      return "";
  }
};

/** Size classes */
const getSizeClasses = (size: "sm" | "md" | "lg"): string => {
  switch (size) {
    case "sm":
      return "text-xs px-1.5 py-0.5";
    case "lg":
      return "text-sm px-3 py-1.5";
    default:
      return "text-xs px-2 py-1";
  }
};

/**
 * SkillBadge - Displays a skill with optional category, proficiency, and contribution info.
 *
 * Used to show skills on modules, courses, learner profiles, and skill gap displays.
 */
export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  category,
  proficiencyLevel,
  contributionLevel,
  isPrimary = false,
  size = "md",
  showCategory = false,
  showLevel = false,
  onClick,
  className,
}) => {
  const categoryColor = getCategoryColor(category);
  const proficiencyInfo = getProficiencyInfo(proficiencyLevel);
  const contributionInfo = getContributionInfo(contributionLevel);
  const sizeClasses = getSizeClasses(size);

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        categoryColor,
        sizeClasses,
        "font-medium gap-1 border transition-colors",
        isPrimary && "ring-2 ring-primary/30",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {showCategory && category && (
        <span className="opacity-70">{getCategoryLabel(category)}</span>
      )}
      <span>{name}</span>
      {showLevel && proficiencyLevel && (
        <span className={cn("font-semibold", proficiencyInfo.color)}>
          ({proficiencyInfo.label})
        </span>
      )}
      {showLevel && contributionLevel && (
        <span className="font-semibold opacity-70">{contributionInfo.icon}</span>
      )}
      {isPrimary && (
        <span className="text-primary ml-0.5" title="Primary skill">
          *
        </span>
      )}
    </Badge>
  );

  // Wrap with tooltip if we have additional info to show
  if (proficiencyLevel || contributionLevel || isPrimary) {
    const tooltipLines: string[] = [];
    if (category) tooltipLines.push(`Category: ${category}`);
    if (proficiencyLevel) tooltipLines.push(`Level: ${proficiencyInfo.label}`);
    if (contributionLevel) tooltipLines.push(`Contribution: ${contributionInfo.label}`);
    if (isPrimary) tooltipLines.push("Primary skill for this module");

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-0.5">
              {tooltipLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
};

/**
 * SkillBadgeList - Displays a list of skills as badges
 */
interface SkillBadgeListProps {
  skills: Array<{
    id?: string;
    name: string;
    category?: SkillCategory;
    proficiencyLevel?: SkillProficiencyLevel;
    contributionLevel?: ModuleSkillContributionLevel;
    isPrimary?: boolean;
  }>;
  size?: "sm" | "md" | "lg";
  showCategory?: boolean;
  showLevel?: boolean;
  maxDisplay?: number;
  onSkillClick?: (skillId: string) => void;
  className?: string;
}

export const SkillBadgeList: React.FC<SkillBadgeListProps> = ({
  skills,
  size = "md",
  showCategory = false,
  showLevel = false,
  maxDisplay,
  onSkillClick,
  className,
}) => {
  const displayedSkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remainingCount = maxDisplay ? skills.length - maxDisplay : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {displayedSkills.map((skill, index) => (
        <SkillBadge
          key={skill.id || index}
          name={skill.name}
          category={skill.category}
          proficiencyLevel={skill.proficiencyLevel}
          contributionLevel={skill.contributionLevel}
          isPrimary={skill.isPrimary}
          size={size}
          showCategory={showCategory}
          showLevel={showLevel}
          onClick={
            onSkillClick && skill.id ? () => onSkillClick(skill.id!) : undefined
          }
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={cn(getSizeClasses(size), "opacity-70")}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default SkillBadge;
