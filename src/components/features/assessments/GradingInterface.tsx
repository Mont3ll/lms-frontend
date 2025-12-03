import React from "react";
import { Question } from "@/lib/types";
import { AssessmentAttempt } from "@/lib/types/assessment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Import Sonner toast
import { Loader2 } from "lucide-react"; // Import Loader

interface GradingInterfaceProps {
  attempt: AssessmentAttempt;
  questions: Question[];
  onSaveGrade: (
    attemptId: string,
    grades: Record<string, { score: number; feedback?: string }>,
  ) => void;
  isSaving: boolean;
}

export const GradingInterface: React.FC<GradingInterfaceProps> = ({
  attempt,
  questions,
  onSaveGrade,
  isSaving,
}) => {
  // const { toast: shadcnToast } = useToast(); // Remove this
  const [manualGrades, setManualGrades] = React.useState<
    Record<string, { score: string; feedback: string }>
  >({});
  const needsManualGrading = questions.some((q) =>
    ["ES", "CODE"].includes(q.question_type),
  );

  React.useEffect(() => {
    const initial: Record<string, { score: string; feedback: string }> = {};
    questions.forEach((q) => {
      if (["ES", "CODE"].includes(q.question_type)) {
        // TODO: Pre-fill with existing score/feedback if attempt was partially graded?
        initial[q.id] = { score: "", feedback: "" };
      }
    });
    setManualGrades(initial);
  }, [attempt, questions]);

  const handleScoreChange = (questionId: string, value: string) => {
    setManualGrades((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], score: value },
    }));
  };
  const handleFeedbackChange = (questionId: string, value: string) => {
    setManualGrades((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], feedback: value },
    }));
  };

  const handleSave = () => {
    const validatedGrades: Record<
      string,
      { score: number; feedback?: string }
    > = {};
    let isValid = true;
    for (const qId in manualGrades) {
      const q = questions.find((q) => q.id === qId);
      if (!q || !["ES", "CODE"].includes(q.question_type)) continue; // Only validate manual ones with state

      const scoreStr = manualGrades[qId].score;
      const feedback = manualGrades[qId].feedback;
      // Allow empty score string (means not graded yet for this question?) - adjust validation if score is required
      if (scoreStr === "") {
        // If score is required for all manual questions before saving:
        // toast.error("Missing Score", { description: `Please enter a score for question "${q.question_text.substring(0, 20)}...".`});
        // isValid = false;
        // break;
        // If score can be partial, allow saving empty/null score:
        validatedGrades[qId] = { score: 0, feedback: feedback || undefined }; // Or handle null score? API needs to allow null/partial grade. Assuming 0 if empty for now.
        continue; // Skip validation if empty is allowed
      }

      const score = parseFloat(scoreStr);

      if (isNaN(score) || score < 0 || score > q.points) {
        // Use Sonner toast
        toast.error("Invalid Score", {
          description: `Score for question "${q.question_text.substring(0, 20)}..." must be between 0 and ${q.points}.`,
        });
        isValid = false;
        break;
      }
      validatedGrades[qId] = { score, feedback: feedback || undefined };
    }

    if (isValid) {
      onSaveGrade(attempt.id, validatedGrades); // Trigger parent save function
    }
  };

  if (!needsManualGrading) {
    /* ... */
  }

  return (
    <Card>
      {/* CardHeader, CardContent with question mapping */}
      <CardHeader>
        <CardTitle>Manual Grading: {attempt.user.email}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review responses and assign scores/feedback.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => {
          if (!["ES", "CODE"].includes(question.question_type)) return null;
          const userAnswer =
            attempt.answers?.[question.id] ?? "[No Answer Provided]";
          const currentGrade = manualGrades[question.id] || {
            score: "",
            feedback: "",
          };
          return (
            <div key={question.id} className="space-y-3 border-b pb-4">
              {/* ... Question Text ... */}
              {/* ... Student Response ... */}
              {/* ... Grading Input ... */}
              <Label className="font-semibold">
                {question.question_text} ({question.points} Points)
              </Label>
              <Card className="bg-muted/50">
                <CardHeader className="p-2 border-b">
                  <CardTitle className="text-sm">Response:</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <pre className="text-sm whitespace-pre-wrap">
                    {String(userAnswer)}
                  </pre>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 items-start pt-1">
                <div>
                  <Label htmlFor={`score-${question.id}`}>Score</Label>
                  <Input
                    id={`score-${question.id}`}
                    type="number"
                    min="0"
                    max={question.points}
                    step="0.5"
                    value={currentGrade.score}
                    onChange={(e) =>
                      handleScoreChange(question.id, e.target.value)
                    }
                    placeholder={`0-${question.points}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`feedback-${question.id}`}>Feedback</Label>
                  <Textarea
                    id={`feedback-${question.id}`}
                    rows={2}
                    value={currentGrade.feedback}
                    onChange={(e) =>
                      handleFeedbackChange(question.id, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Grades
        </Button>
      </CardFooter>
    </Card>
  );
};
