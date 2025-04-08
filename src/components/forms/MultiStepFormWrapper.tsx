"use client";

import React, { useState, ReactNode, Children, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
// import { Progress } from '@/components/ui/progress'; // Optional progress bar

interface MultiStepFormWrapperProps {
  children: ReactNode; // Expect multiple child components representing steps
  onFinalSubmit: () => void; // Callback when the final step is submitted
  submitButtonText?: string;
  isSubmitting?: boolean; // Loading state for final submit
}

export const MultiStepFormWrapper: React.FC<MultiStepFormWrapperProps> = ({
  children,
  onFinalSubmit,
  submitButtonText = "Submit",
  isSubmitting = false,
}) => {
  const steps = Children.toArray(children).filter(isValidElement);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const nextStep = () => {
    if (!isLastStep) {
      // TODO: Add validation logic for the current step before proceeding
      // This usually involves triggering validation from the child form component
      // Example: Assume child exposes a validation function via ref or context
      // const isValid = await validateCurrentStep();
      // if (isValid) {
      setCurrentStepIndex((prev) => prev + 1);
      // }
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default if wrapper has form tag
    if (isLastStep) {
      onFinalSubmit();
    } else {
      nextStep();
    }
  };

  const CurrentStepComponent = steps[currentStepIndex];
  // Optional progress calculation
  // const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    // Optionally wrap the entire thing in a FormProvider if steps share form state
    <div className="space-y-6">
      {/* Optional Progress Indicator */}
      {/* <Progress value={progress} className="w-full h-2 mb-6" /> */}

      {/* Render the current step component */}
      {/* Pass down functions or state via props or context if needed */}
      {CurrentStepComponent}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button" // Important: type="button" to prevent submitting outer form if any
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <Button
          type="button" // Use type="submit" if this button should submit the active step's form part
          onClick={isLastStep ? onFinalSubmit : nextStep} // Trigger final submit or move next
          disabled={isSubmitting}
        >
          {isSubmitting && isLastStep && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isLastStep ? submitButtonText : "Next"}
          {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
          {isLastStep && !isSubmitting && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
