"use client";

import React, { useState, ReactNode, Children, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MultiStepFormWrapperProps {
  children: ReactNode; // Expect multiple child components representing steps
  onFinalSubmit: () => void; // Callback when the final step is submitted
  submitButtonText?: string;
  isSubmitting?: boolean; // Loading state for final submit
  /**
   * Optional async function to validate the current step before proceeding.
   * Receives the current step index (0-based) and should return true if valid.
   * If not provided, navigation proceeds without validation.
   */
  validateStep?: (stepIndex: number) => Promise<boolean>;
  /**
   * Optional array of step labels for the progress indicator.
   * If provided, shows a stepper with labels above the content.
   */
  stepLabels?: string[];
  /**
   * Whether to show the progress bar. Defaults to false.
   */
  showProgress?: boolean;
}

export const MultiStepFormWrapper: React.FC<MultiStepFormWrapperProps> = ({
  children,
  onFinalSubmit,
  submitButtonText = "Submit",
  isSubmitting = false,
  validateStep,
  stepLabels,
  showProgress = false,
}) => {
  const steps = Children.toArray(children).filter(isValidElement);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const nextStep = async () => {
    if (!isLastStep) {
      // If a validateStep function is provided, run validation first
      if (validateStep) {
        setIsValidating(true);
        try {
          const isValid = await validateStep(currentStepIndex);
          if (isValid) {
            setCurrentStepIndex((prev) => prev + 1);
          }
        } finally {
          setIsValidating(false);
        }
      } else {
        // No validation, proceed directly
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  };

  const handleFinalSubmit = async () => {
    // Validate final step if validateStep is provided
    if (validateStep) {
      setIsValidating(true);
      try {
        const isValid = await validateStep(currentStepIndex);
        if (isValid) {
          onFinalSubmit();
        }
      } finally {
        setIsValidating(false);
      }
    } else {
      onFinalSubmit();
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStepIndex];
  // Progress calculation
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLoading = isValidating || isSubmitting;

  return (
    <div className="space-y-6">
      {/* Step Labels / Stepper */}
      {stepLabels && stepLabels.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                    index < currentStepIndex
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStepIndex
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-xs text-center ${
                    index <= currentStepIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < stepLabels.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar (alternative to step labels) */}
      {showProgress && !stepLabels && (
        <Progress value={progress} className="w-full h-2 mb-6" />
      )}

      {/* Render the current step component */}
      {CurrentStepComponent}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep || isLoading}
          className="cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <Button
          type="button"
          onClick={isLastStep ? handleFinalSubmit : nextStep}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLastStep ? submitButtonText : "Next"}
          {!isLastStep && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          {isLastStep && !isLoading && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
