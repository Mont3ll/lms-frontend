import React from "react";
import { useFormContext, Controller, FieldError } from "react-hook-form";
import { Question } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

interface MatchingPrompt {
  id: string;
  text: string;
}

interface MatchingMatch {
  id: string;
  text: string;
}

interface FillBlankData {
  correct: string[];
}

interface TypeSpecificData {
  options?: QuestionOption[];
  allow_multiple?: boolean;
  // Matching question data
  prompts?: MatchingPrompt[];
  matches?: MatchingMatch[];
  correct_pairs?: Array<{ prompt_id: string; match_id: string }>;
  // Fill-in-blanks question data
  text?: string;
  blanks?: Record<string, FillBlankData>;
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

      case "MT": {
        // Matching Question: Users match prompts to their corresponding answers
        const prompts = typeData?.prompts || [];
        const matches = typeData?.matches || [];

        if (prompts.length === 0 || matches.length === 0) {
          return (
            <p className="text-sm text-muted-foreground">
              Matching question is not configured properly.
            </p>
          );
        }

        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={{}}
            render={({ field }) => (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Match each item on the left with its corresponding answer on the right.
                </p>
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md bg-muted/30"
                  >
                    <div className="flex-1 font-medium">{prompt.text}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm hidden sm:inline">
                        matches with
                      </span>
                      <Select
                        value={field.value?.[prompt.id] || ""}
                        onValueChange={(value) => {
                          const newValue = { ...field.value, [prompt.id]: value };
                          field.onChange(newValue);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select a match..." />
                        </SelectTrigger>
                        <SelectContent>
                          {matches.map((match) => (
                            <SelectItem key={match.id} value={match.id}>
                              {match.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        );
      }

      case "FB": {
        // Fill in the Blanks: Text with placeholders that users need to fill
        const blankText = typeData?.text || question.question_text;
        const blanks = typeData?.blanks || {};
        const blankIds = Object.keys(blanks);

        if (blankIds.length === 0) {
          return (
            <p className="text-sm text-muted-foreground">
              Fill-in-blanks question is not configured properly.
            </p>
          );
        }

        // Parse the text and replace [blankN] placeholders with input fields
        // Text format: "The capital of France is [blank1]. Paris is known for the [blank2]."
        const parts = blankText.split(/(\[blank\d+\])/g);

        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={{}}
            render={({ field }) => (
              <div className="space-y-4">
                <div className="leading-relaxed text-base flex flex-wrap items-center gap-1">
                  {parts.map((part, index) => {
                    const blankMatch = part.match(/\[(blank\d+)\]/);
                    if (blankMatch) {
                      const blankId = blankMatch[1];
                      return (
                        <Input
                          key={index}
                          placeholder="..."
                          className="inline-block w-32 mx-1 text-center"
                          value={field.value?.[blankId] || ""}
                          onChange={(e) => {
                            const newValue = {
                              ...field.value,
                              [blankId]: e.target.value,
                            };
                            field.onChange(newValue);
                          }}
                        />
                      );
                    }
                    // Regular text part
                    return <span key={index}>{part}</span>;
                  })}
                </div>
                {/* Alternative: Show blanks as a list if text parsing doesn't work well */}
                {blankIds.length > 0 && parts.length === 1 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Fill in the following blanks:
                    </p>
                    {blankIds.map((blankId, idx) => (
                      <div key={blankId} className="flex items-center gap-3">
                        <Label className="text-sm font-medium">
                          Blank {idx + 1}:
                        </Label>
                        <Input
                          placeholder="Enter your answer..."
                          className="max-w-xs"
                          value={field.value?.[blankId] || ""}
                          onChange={(e) => {
                            const newValue = {
                              ...field.value,
                              [blankId]: e.target.value,
                            };
                            field.onChange(newValue);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        );
      }

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
