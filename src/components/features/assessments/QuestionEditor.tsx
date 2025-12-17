import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form"; // For managing list of questions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/forms/SelectField";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, PlusCircle, GripVertical } from "lucide-react";

// Question type choices matching backend model
const QUESTION_TYPE_CHOICES = [
  { value: "MC", label: "Multiple Choice" },
  { value: "TF", label: "True/False" },
  { value: "SA", label: "Short Answer" },
  { value: "MT", label: "Matching" },
  { value: "FB", label: "Fill in the Blanks" },
  { value: "ES", label: "Essay" },
  { value: "CD", label: "Code" },
];

interface QuestionErrors {
  question_text?: { message?: string };
  points?: { message?: string };
  type_specific_data?: {
    options?: Array<{
      text?: { message?: string };
    }>;
  };
}

// Component for editing multiple choice options within a question
const MCOptionEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${parentFieldIndex}.type_specific_data.options`,
  });

  const allowMultiple = watch(
    `questions.${parentFieldIndex}.type_specific_data.allow_multiple`
  );

  const addOption = () => {
    append({ text: "", is_correct: false });
  };

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No options added yet. Click &quot;Add Option&quot; to create answer choices.
        </p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, optionIndex) => (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2 bg-background rounded-md border"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
              <div className="flex-1">
                <Input
                  placeholder={`Option ${optionIndex + 1}`}
                  {...register(
                    `questions.${parentFieldIndex}.type_specific_data.options.${optionIndex}.text`
                  )}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`questions.${parentFieldIndex}.type_specific_data.options.${optionIndex}.is_correct`}
                  render={({ field: checkboxField }) => (
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`option-correct-${parentFieldIndex}-${optionIndex}`}
                        checked={checkboxField.value}
                        onCheckedChange={checkboxField.onChange}
                      />
                      <Label
                        htmlFor={`option-correct-${parentFieldIndex}-${optionIndex}`}
                        className="text-xs text-muted-foreground whitespace-nowrap cursor-pointer"
                      >
                        {allowMultiple ? "Correct" : "Correct Answer"}
                      </Label>
                    </div>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => remove(optionIndex)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Option
      </Button>
    </div>
  );
};

// Component for editing True/False questions
const TrueFalseEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label>Correct Answer</Label>
      <Controller
        control={control}
        name={`questions.${parentFieldIndex}.type_specific_data.correct_answer`}
        render={({ field }) => (
          <RadioGroup
            value={field.value?.toString() ?? "true"}
            onValueChange={(value) => field.onChange(value === "true")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`tf-true-${parentFieldIndex}`} />
              <Label
                htmlFor={`tf-true-${parentFieldIndex}`}
                className="cursor-pointer font-normal"
              >
                True
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`tf-false-${parentFieldIndex}`} />
              <Label
                htmlFor={`tf-false-${parentFieldIndex}`}
                className="cursor-pointer font-normal"
              >
                False
              </Label>
            </div>
          </RadioGroup>
        )}
      />
      <p className="text-xs text-muted-foreground">
        Select the correct answer for this True/False question.
      </p>
    </div>
  );
};

// Component for editing Matching questions (left_item ↔ right_item pairs)
const MatchingEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${parentFieldIndex}.type_specific_data.pairs`,
  });

  const addPair = () => {
    append({ id: crypto.randomUUID(), left_item: "", right_item: "" });
  };

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label>Matching Pairs</Label>
      <p className="text-xs text-muted-foreground">
        Define pairs to match. Left items will be matched to right items.
      </p>
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No pairs added yet. Click &quot;Add Pair&quot; to create matching items.
        </p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, pairIndex) => (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2 bg-background rounded-md border"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
              <div className="flex-1">
                <Input
                  placeholder={`Left item ${pairIndex + 1}`}
                  {...register(
                    `questions.${parentFieldIndex}.type_specific_data.pairs.${pairIndex}.left_item`
                  )}
                  className="h-8"
                />
              </div>
              <span className="text-muted-foreground text-sm">↔</span>
              <div className="flex-1">
                <Input
                  placeholder={`Right item ${pairIndex + 1}`}
                  {...register(
                    `questions.${parentFieldIndex}.type_specific_data.pairs.${pairIndex}.right_item`
                  )}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => remove(pairIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPair}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Pair
      </Button>
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.shuffle_items`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`shuffle-items-${parentFieldIndex}`}
                  checked={checkboxField.value ?? true}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`shuffle-items-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Shuffle items when displayed
                </Label>
              </>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.allow_partial_credit`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`partial-credit-${parentFieldIndex}`}
                  checked={checkboxField.value ?? true}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`partial-credit-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Allow partial credit
                </Label>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

// Component for editing Fill in the Blanks questions
const FillBlanksEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control, register } = useFormContext();

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label>Fill in the Blanks Text</Label>
      <Textarea
        placeholder="Enter text with blanks using [answer] syntax. Example: The capital of France is [Paris]."
        {...register(
          `questions.${parentFieldIndex}.type_specific_data.text_with_blanks`
        )}
        rows={4}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Use <code className="bg-muted px-1 rounded">[answer]</code> to mark a blank.</p>
        <p>Use <code className="bg-muted px-1 rounded">[answer1|answer2]</code> for multiple accepted answers.</p>
        <p>Example: The [quick|fast] brown [fox] jumps over the lazy [dog].</p>
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.case_sensitive`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`case-sensitive-${parentFieldIndex}`}
                  checked={checkboxField.value ?? false}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`case-sensitive-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Case sensitive answers
                </Label>
              </>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.allow_partial_credit`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`fb-partial-credit-${parentFieldIndex}`}
                  checked={checkboxField.value ?? true}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`fb-partial-credit-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Allow partial credit
                </Label>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

// Component for editing Essay questions
const EssayEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control, register } = useFormContext();

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label>Essay Settings</Label>
      <p className="text-xs text-muted-foreground">
        Essay questions require manual grading by an instructor.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`min-words-${parentFieldIndex}`}>Minimum Words</Label>
          <Input
            id={`min-words-${parentFieldIndex}`}
            type="number"
            min="0"
            placeholder="Optional"
            {...register(
              `questions.${parentFieldIndex}.type_specific_data.min_words`,
              { valueAsNumber: true }
            )}
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor={`max-words-${parentFieldIndex}`}>Maximum Words</Label>
          <Input
            id={`max-words-${parentFieldIndex}`}
            type="number"
            min="0"
            placeholder="Optional"
            {...register(
              `questions.${parentFieldIndex}.type_specific_data.max_words`,
              { valueAsNumber: true }
            )}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`rubric-${parentFieldIndex}`}>Grading Rubric (Optional)</Label>
        <Textarea
          id={`rubric-${parentFieldIndex}`}
          placeholder="Enter grading criteria and rubric for this essay question..."
          {...register(
            `questions.${parentFieldIndex}.type_specific_data.rubric`
          )}
          rows={3}
        />
      </div>
      <div className="flex items-center space-x-2 pt-2 border-t">
        <Controller
          control={control}
          name={`questions.${parentFieldIndex}.type_specific_data.allow_file_upload`}
          render={({ field: checkboxField }) => (
            <>
              <Checkbox
                id={`allow-file-upload-${parentFieldIndex}`}
                checked={checkboxField.value ?? false}
                onCheckedChange={checkboxField.onChange}
              />
              <Label
                htmlFor={`allow-file-upload-${parentFieldIndex}`}
                className="cursor-pointer font-normal"
              >
                Allow file upload
              </Label>
            </>
          )}
        />
      </div>
    </div>
  );
};

// Language options for Code questions
const CODE_LANGUAGE_OPTIONS = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "other", label: "Other" },
];

// Component for editing Code questions
const CodeEditor = ({ parentFieldIndex }: { parentFieldIndex: number }) => {
  const { control, register } = useFormContext();

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label>Code Question Settings</Label>
      <p className="text-xs text-muted-foreground">
        Code questions require manual grading by an instructor.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          name={`questions.${parentFieldIndex}.type_specific_data.language`}
          label="Language"
          options={CODE_LANGUAGE_OPTIONS}
        />
        <div>
          <Label htmlFor={`max-file-size-${parentFieldIndex}`}>Max File Size (MB)</Label>
          <Input
            id={`max-file-size-${parentFieldIndex}`}
            type="number"
            min="1"
            max="50"
            placeholder="5"
            {...register(
              `questions.${parentFieldIndex}.type_specific_data.max_file_size_mb`,
              { valueAsNumber: true }
            )}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`template-code-${parentFieldIndex}`}>Template Code (Optional)</Label>
        <Textarea
          id={`template-code-${parentFieldIndex}`}
          placeholder="Enter starter code that students will begin with..."
          {...register(
            `questions.${parentFieldIndex}.type_specific_data.template_code`
          )}
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Provide starter code or a code template for students.
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.allow_multiple_files`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`allow-multiple-files-${parentFieldIndex}`}
                  checked={checkboxField.value ?? false}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`allow-multiple-files-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Allow multiple file submissions
                </Label>
              </>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name={`questions.${parentFieldIndex}.type_specific_data.enable_syntax_highlighting`}
            render={({ field: checkboxField }) => (
              <>
                <Checkbox
                  id={`syntax-highlighting-${parentFieldIndex}`}
                  checked={checkboxField.value ?? true}
                  onCheckedChange={checkboxField.onChange}
                />
                <Label
                  htmlFor={`syntax-highlighting-${parentFieldIndex}`}
                  className="cursor-pointer font-normal"
                >
                  Enable syntax highlighting
                </Label>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

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
    control,
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
          <div className="space-y-3 border p-3 rounded-md">
            <Label>Multiple Choice Options</Label>
            <MCOptionEditor parentFieldIndex={index} />
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Controller
                control={control}
                name={`questions.${index}.type_specific_data.allow_multiple`}
                render={({ field: checkboxField }) => (
                  <>
                    <Checkbox
                      id={`questions.${index}.type_specific_data.allow_multiple`}
                      checked={checkboxField.value}
                      onCheckedChange={checkboxField.onChange}
                    />
                    <Label
                      htmlFor={`questions.${index}.type_specific_data.allow_multiple`}
                      className="cursor-pointer"
                    >
                      Allow Multiple Correct Answers
                    </Label>
                  </>
                )}
              />
            </div>
          </div>
        )}
        {questionType === "TF" && <TrueFalseEditor parentFieldIndex={index} />}
        {questionType === "MT" && <MatchingEditor parentFieldIndex={index} />}
        {questionType === "FB" && <FillBlanksEditor parentFieldIndex={index} />}
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
        {questionType === "ES" && <EssayEditor parentFieldIndex={index} />}
        {questionType === "CD" && <CodeEditor parentFieldIndex={index} />}
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
