import React from "react";
import { useFormContext, Controller, FieldError } from "react-hook-form";
import { Question } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

interface TypeSpecificData {
  options?: QuestionOption[];
  allow_multiple?: boolean;
}

interface QuestionRendererProps {
  question: Question;
  index: number; // Question number (1-based)
  // error?: FieldError | undefined; // Receive error state from parent form
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  index /*, error */,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext(); // Use form context
  const fieldName = String(question.id); // Use question ID as field name in the form
  const error = errors[fieldName] as FieldError | undefined; // Get error for this specific field

  const renderQuestionType = () => {
    const typeData = question.type_specific_data as TypeSpecificData | undefined;
    switch (question.question_type) {
      case "MC":
      case "TF": // Treat TF similar to MC single choice for rendering
        const options = typeData?.options || [];
        const allowMultiple = typeData?.allow_multiple || false;

        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) =>
              allowMultiple ? (
                // Checkboxes for Multiple Answers Allowed
                <div className="space-y-2">
                  {options.map((option: QuestionOption) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${fieldName}-${option.id}`}
                        checked={field.value?.includes(option.id)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, option.id]);
                          } else {
                            field.onChange(
                              currentValues.filter(
                                (val: string) => val !== option.id,
                              ),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`${fieldName}-${option.id}`}
                        className="font-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                // Radio Group for Single Answer
                <RadioGroup
                  onValueChange={field.onChange} // Update form state on change
                  defaultValue={field.value} // Set initial value if editing/resuming
                  className="flex flex-col space-y-1"
                >
                  {options.map((option: QuestionOption) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`${fieldName}-${option.id}`}
                      />
                      <Label
                        htmlFor={`${fieldName}-${option.id}`}
                        className="font-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )
            }
          />
        );

      case "SA": // Short Answer
        return (
          <Input
            id={fieldName}
            {...register(fieldName)}
            aria-invalid={!!error}
            className={cn(error && "border-destructive")}
          />
        );

      case "ES": // Essay
      case "CODE": // Treat code submission as textarea for now
        return (
          <Textarea
            id={fieldName}
            rows={8}
            {...register(fieldName)}
            placeholder={
              question.question_type === "CODE"
                ? "Enter your code here..."
                : "Enter your response here..."
            }
            aria-invalid={!!error}
            className={cn(error && "border-destructive")}
          />
        );

      // TODO: Implement renderers for Matching, Fill Blanks etc.
      case "MT":
        return (
          <p className="text-sm text-muted-foreground">
            Matching Question Renderer - Not Implemented
          </p>
        );
      case "FB":
        return (
          <p className="text-sm text-muted-foreground">
            Fill Blanks Renderer - Not Implemented
          </p>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            Unsupported question type.
          </p>
        );
    }
  };

  return (
    <div className="space-y-3 border-b pb-6 mb-6">
      <Label
        htmlFor={fieldName}
        className="font-semibold text-base flex items-start"
      >
        <span className="mr-2 text-primary font-bold">{index}.</span>
        {/* Render question text - consider using Markdown/HTML renderer if needed */}
        <span>{question.question_text}</span>
        <span className="ml-auto pl-4 text-sm font-normal text-muted-foreground whitespace-nowrap">
          ({question.points} Points)
        </span>
      </Label>
      <div className="pl-6">
        {" "}
        {/* Indent options/input */}
        {renderQuestionType()}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive pl-6 mt-1">
          {error.message}
        </p>
      )}
      {question.feedback && (
        <p className="text-xs text-muted-foreground pl-6 mt-1">
          Feedback: {question.feedback}
        </p>
      )}
    </div>
  );
};
