import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form"; // For managing list of questions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/forms/SelectField";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, PlusCircle } from "lucide-react";

// Question type choices matching backend model
const QUESTION_TYPE_CHOICES = [
  { value: "MC", label: "Multiple Choice" },
  { value: "TF", label: "True/False" },
  { value: "SA", label: "Short Answer" },
  { value: "ES", label: "Essay" },
  // Add others
];

interface QuestionErrors {
  question_text?: { message?: string };
  points?: { message?: string };
}

// Component for editing a single question within a list
const SingleQuestionEditor = ({
  index,
  remove,
}: {
  index: number;
  remove: (index: number) => void;
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext(); // Access form context
  const questionType = watch(`questions.${index}.question_type`);
  // Get errors specific to this question index
  const questionsArrayErrors = errors.questions as Array<QuestionErrors> | undefined;
  const qErrors = questionsArrayErrors?.[index];

  return (
    <Card className="p-4 border bg-muted/30">
      <div className="flex justify-between items-start mb-3">
        <Label className="font-semibold">Question {index + 1}</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => remove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <Label htmlFor={`questions.${index}.question_text`}>
            Question Text
          </Label>
          <Textarea
            id={`questions.${index}.question_text`}
            {...register(`questions.${index}.question_text`)}
            rows={3}
          />
          {qErrors?.question_text && (
            <p className="text-sm text-destructive mt-1">
              {qErrors.question_text.message}
            </p>
          )}
        </div>
        {/* Question Type & Points */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            name={`questions.${index}.question_type`}
            label="Type"
            options={QUESTION_TYPE_CHOICES}
          />
          <div>
            <Label htmlFor={`questions.${index}.points`}>Points</Label>
            <Input
              id={`questions.${index}.points`}
              type="number"
              min="0"
              {...register(`questions.${index}.points`, {
                valueAsNumber: true,
              })}
            />
            {qErrors?.points && (
              <p className="text-sm text-destructive mt-1">
                {qErrors.points.message}
              </p>
            )}
          </div>
        </div>
        {/* Type Specific Data Area */}
        {questionType === "MC" && (
          <div className="space-y-2 border p-3 rounded-md">
            <Label>Multiple Choice Options</Label>
            {/* TODO: Implement dynamic add/remove options using useFieldArray for options */}
            <p className="text-xs text-muted-foreground">
              Option editor UI placeholder (add option, mark correct, text
              input).
            </p>
            {/* <MCOptionEditor parentFieldIndex={index} /> */}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id={`questions.${index}.type_specific_data.allow_multiple`}
                {...register(
                  `questions.${index}.type_specific_data.allow_multiple`,
                )}
              />
              <Label
                htmlFor={`questions.${index}.type_specific_data.allow_multiple`}
              >
                Allow Multiple Correct Answers
              </Label>
            </div>
          </div>
        )}
        {questionType === "SA" && (
          <div className="space-y-2 border p-3 rounded-md">
            <Label>Short Answer Correct Answers</Label>
            <Textarea
              placeholder="Enter possible correct answers, one per line."
              {...register(
                `questions.${index}.type_specific_data.correct_answers_text`,
              )}
            />
            <p className="text-xs text-muted-foreground">
              Comparison is case-insensitive by default.
            </p>
            {/* TODO: Need to parse this text into list in onSubmit */}
          </div>
        )}
        {/* Add editors for other question types */}
        {/* General Feedback */}
        <div>
          <Label htmlFor={`questions.${index}.feedback`}>
            Feedback (Optional)
          </Label>
          <Textarea
            id={`questions.${index}.feedback`}
            {...register(`questions.${index}.feedback`)}
            rows={2}
          />
        </div>
      </div>
    </Card>
  );
};

// Main component managing the list of questions
export const QuestionEditor = () => {
  const { control } = useFormContext(); // Get control from parent form (likely Assessment Form)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions", // Name of the field array in the parent form's data
  });

  const addQuestion = () => {
    // Append a new question object with default values
    append({
      question_text: "",
      question_type: "MC", // Default type
      points: 1,
      type_specific_data: { options: [], allow_multiple: false }, // Default for MC
      feedback: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <SingleQuestionEditor key={field.id} index={index} remove={remove} />
        ))}
        <Button type="button" variant="outline" onClick={addQuestion}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </CardContent>
    </Card>
  );
};
