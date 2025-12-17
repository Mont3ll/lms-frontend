'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2, Eye, Settings, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type { Assessment, Question, QuestionOption } from '@/lib/types/assessment';

// Type helper for accessing type_specific_data properties
type TypeSpecificData = {
  options?: QuestionOption[];
  acceptable_answers?: string[];
  case_sensitive?: boolean;
  programming_language?: string;
  submission_type?: string;
  expected_output?: string;
  starter_code?: string;
  auto_grade?: boolean;
  matching_pairs?: Array<{ left: string; right: string; id: string }>;
  shuffle_options?: boolean;
  passage_text?: string;
  blank_answers?: Array<{ id: string; correct_answers: string[]; case_sensitive?: boolean }>;
  min_words?: number;
  max_words?: number;
  grading_rubric?: string;
  sample_answer?: string;
};

// Helper to safely access type_specific_data
const getTypeData = (question: Question): TypeSpecificData => 
  (question.type_specific_data as TypeSpecificData) || {};

// Silence unused variable warning - used for type inference
void getTypeData;

export default function EditAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Calculate total points dynamically from questions
  const totalPoints = assessment?.questions?.reduce((total, question) => {
    return total + (question.points || 0);
  }, 0) || 0;

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/instructor/assessments/${assessmentId}/`);
      
      // Convert backend format to frontend format
      const assessmentData = response.data;
      
      // Transform questions to match frontend structure
      if (assessmentData.questions) {
        assessmentData.questions = assessmentData.questions.map((question: Question) => {
          const transformedQuestion = { ...question };
          
          // For MC and TF questions, move options from type_specific_data.options to question.options
          const typeData = question.type_specific_data as { options?: QuestionOption[] } | undefined;
          if ((question.question_type === 'MC' || question.question_type === 'TF') && 
              typeData?.options) {
            transformedQuestion.options = typeData.options.map((option: QuestionOption) => ({
              id: option.id,
              option_text: option.text, // Convert 'text' to 'option_text'
              is_correct: option.is_correct
            }));
          }
          
          return transformedQuestion;
        });
      }
      
      setAssessment(assessmentData);
    } catch (error) {
      toast.error('Failed to load assessment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId, fetchAssessment]);

  const handleSave = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      
      // First, save the assessment metadata (including the course field)
      await apiClient.put(`/instructor/assessments/${assessmentId}/`, {
        course: assessment.course, // Include the course field which is required
        title: assessment.title,
        description: assessment.description,
        assessment_type: assessment.assessment_type,
        grading_type: assessment.grading_type,
        due_date: assessment.due_date,
        time_limit_minutes: assessment.time_limit_minutes,
        max_attempts: assessment.max_attempts,
        pass_mark_percentage: assessment.pass_mark_percentage,
        show_results_immediately: assessment.show_results_immediately,
        shuffle_questions: assessment.shuffle_questions,
        is_published: assessment.is_published
      });

      // Only save questions if there are any questions to save
      if (assessment.questions && assessment.questions.length > 0) {
        try {
          // Then, save each question individually
          for (const question of assessment.questions) {
            // Skip questions that don't have proper content
            if (!question.question_text || question.question_text.trim() === '') {
              continue;
            }

            // Convert frontend question structure to backend format
            let type_specific_data = question.type_specific_data || {};
            
            // For MC and TF questions, move options from question.options to type_specific_data.options
            if ((question.question_type === 'MC' || question.question_type === 'TF') && question.options) {
              type_specific_data = {
                ...type_specific_data,
                options: question.options.map(option => ({
                  id: option.id,
                  text: option.option_text, // Convert option_text back to text for backend
                  is_correct: option.is_correct || false
                })),
                allow_multiple: question.question_type === 'MC' ? false : false // Set to true for multi-select MC if needed
              };
            }

            const questionData = {
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              order: question.order,
              type_specific_data: type_specific_data,
              feedback: question.feedback || ''
            };

            if (question.id.startsWith('temp-')) {
              // Create new question
              await apiClient.post(`/instructor/assessments/${assessmentId}/questions/`, questionData);
            } else {
              // Update existing question
              await apiClient.patch(`/instructor/assessments/${assessmentId}/questions/${question.id}/`, questionData);
            }
          }
        } catch (questionError) {
          console.error('Error saving questions:', questionError);
          toast.error('Assessment saved, but some questions failed to save. Please check and try again.');
          return; // Don't refresh if questions failed
        }
      }

      // Refresh the assessment data to get updated IDs and total points
      await fetchAssessment();
      
      toast.success('Assessment saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      // First save the current assessment data to ensure questions are persisted
      await handleSave();
      
      // Then update the published status
      const response = await apiClient.patch(`/instructor/assessments/${assessmentId}/`, {
        is_published: !assessment.is_published
      });
      
      // Update only the published status, keeping existing data
      setAssessment(prev => prev ? {
        ...prev,
        is_published: response.data.is_published
      } : null);
      
      toast.success(assessment.is_published ? 'Assessment unpublished' : 'Assessment published');
    } catch (error) {
      toast.error('Failed to update assessment');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!assessment) return;

    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      assessment: assessmentId,
      question_text: '',
      question_type: 'MC',
      question_type_display: 'Multiple Choice',
      points: 1,
      type_specific_data: {},
      order: assessment.questions.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: [
        { id: `temp-opt-1-${Date.now()}`, option_text: '', is_correct: true },
        { id: `temp-opt-2-${Date.now()}`, option_text: '', is_correct: false }
      ]
    };

    setAssessment(prev => prev ? {
      ...prev,
      questions: [...prev.questions, newQuestion]
    } : null);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!assessment) return;

    setAssessment(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    } : null);
  };

  const deleteQuestion = async (questionId: string) => {
    if (!assessment) return;

    // If it's a temporary question (not saved yet), just remove from state
    if (questionId.startsWith('temp-')) {
      setAssessment(prev => prev ? {
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      } : null);
      return;
    }

    // For existing questions, delete from backend
    try {
      await apiClient.delete(`/instructor/assessments/${assessmentId}/questions/${questionId}/`);
      
      // Remove from local state after successful deletion
      setAssessment(prev => prev ? {
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      } : null);
      
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
      console.error(error);
    }
  };

  const addOption = (questionId: string) => {
    if (!assessment) return;

    const newOption = {
      id: `temp-opt-${Date.now()}`,
      option_text: '',
      is_correct: false
    };

    updateQuestion(questionId, {
      options: [...(assessment.questions.find(q => q.id === questionId)?.options || []), newOption]
    });
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<{ id: string; option_text: string; is_correct: boolean }>) => {
    if (!assessment) return;

    const question = assessment.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    updateQuestion(questionId, { options: updatedOptions });
  };

  const deleteOption = (questionId: string, optionId: string) => {
    if (!assessment) return;

    const question = assessment.questions.find(q => q.id === questionId);
    if (!question || !question.options || question.options.length <= 2) return;

    const updatedOptions = question.options.filter(opt => opt.id !== optionId);
    updateQuestion(questionId, { options: updatedOptions });
  };

  // Question type options mapping
  const questionTypeOptions = [
    { value: 'MC', label: 'Multiple Choice', display: 'Multiple Choice' },
    { value: 'TF', label: 'True/False', display: 'True/False' },
    { value: 'SA', label: 'Short Answer', display: 'Short Answer' },
    { value: 'ES', label: 'Essay', display: 'Essay' },
    { value: 'CODE', label: 'Code Submission', display: 'Code Submission' },
    { value: 'MT', label: 'Matching', display: 'Matching' },
    { value: 'FB', label: 'Fill in the Blanks', display: 'Fill in the Blanks' }
  ];

  const changeQuestionType = (questionId: string, newType: string) => {
    if (!assessment) return;

    const typeOption = questionTypeOptions.find(opt => opt.value === newType);
    if (!typeOption) return;

    // Create appropriate default data based on question type
    const defaultData: Partial<Question> = {
      question_type: newType as Question['question_type'],
      question_type_display: typeOption.display
    };

    // Set up default structure based on question type
    switch (newType) {
      case 'MC':
        defaultData.options = [
          { id: `temp-opt-1-${Date.now()}`, option_text: '', is_correct: true },
          { id: `temp-opt-2-${Date.now()}`, option_text: '', is_correct: false }
        ];
        break;
      case 'TF':
        defaultData.options = [
          { id: `temp-opt-true-${Date.now()}`, option_text: 'True', is_correct: true },
          { id: `temp-opt-false-${Date.now()}`, option_text: 'False', is_correct: false }
        ];
        break;
      case 'SA':
      case 'ES':
      case 'CODE':
      case 'MT':
      case 'FB':
        // These types don't use options, remove them if they exist
        defaultData.options = undefined;
        break;
    }

    updateQuestion(questionId, defaultData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Assessment not found</p>
        <Button onClick={() => router.back()} className="mt-4 cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Assessment</h1>
            <p className="text-gray-600">Course: {assessment.course_title || 'Unknown Course'}</p>
          </div>
          <Badge variant={assessment.is_published ? 'default' : 'secondary'}>
            {assessment.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/instructor/assessments/${assessmentId}/results`)}
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Results
          </Button>
          <Button
            variant="outline"
            onClick={handlePublish}
            disabled={saving}
            className="cursor-pointer"
          >
            {assessment.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <Settings className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="questions">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions ({assessment.questions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Assessment Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={assessment.title || ''}
                    onChange={(e) => setAssessment(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select
                    value={assessment.assessment_type || 'QUIZ'}
                    onValueChange={(value) => setAssessment(prev => prev ? { ...prev, assessment_type: value as Assessment['assessment_type'] } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assessment.description || ''}
                  onChange={(e) => setAssessment(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={assessment.time_limit_minutes || ''}
                    onChange={(e) => setAssessment(prev => prev ? { 
                      ...prev, 
                      time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                    } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="0"
                    value={assessment.max_attempts || 1}
                    onChange={(e) => setAssessment(prev => prev ? { 
                      ...prev, 
                      max_attempts: parseInt(e.target.value) || 1 
                    } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passMark">Pass Mark (%)</Label>
                  <Input
                    id="passMark"
                    type="number"
                    min="0"
                    max="100"
                    value={assessment.pass_mark_percentage || 50}
                    onChange={(e) => setAssessment(prev => prev ? { 
                      ...prev, 
                      pass_mark_percentage: parseInt(e.target.value) || 50 
                    } : null)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Results Immediately</Label>
                    <p className="text-sm text-gray-600">Display score and feedback after submission</p>
                  </div>
                  <Switch
                    checked={assessment.show_results_immediately || false}
                    onCheckedChange={(checked) => setAssessment(prev => prev ? { 
                      ...prev, 
                      show_results_immediately: checked 
                    } : null)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-sm text-gray-600">Randomize question order for each attempt</p>
                  </div>
                  <Switch
                    checked={assessment.shuffle_questions || false}
                    onCheckedChange={(checked) => setAssessment(prev => prev ? { 
                      ...prev, 
                      shuffle_questions: checked 
                    } : null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Questions</h3>
              <p className="text-gray-600">Total Points: {totalPoints}</p>
            </div>
            <Button onClick={addQuestion} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-4">
            {(assessment.questions || []).map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => changeQuestionType(question.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {question.question_type_display || question.question_type}
                              </Badge>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question_text || ''}
                      onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="0"
                        value={question.points || 1}
                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={question.is_required || false}
                        onCheckedChange={(checked) => updateQuestion(question.id, { is_required: checked })}
                      />
                      <Label>Required</Label>
                    </div>
                  </div>

                  {/* Multiple Choice Options */}
                  {(question.question_type === 'MC' || question.question_type === 'TF') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        {question.question_type === 'MC' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optIndex) => (
                          <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Switch
                              checked={option.is_correct || false}
                              onCheckedChange={(checked) => updateOption(question.id, option.id, { is_correct: checked })}
                            />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option.option_text || ''}
                              onChange={(e) => updateOption(question.id, option.id, { option_text: e.target.value })}
                              className="flex-1"
                              disabled={question.question_type === 'TF'} // True/False options are fixed
                            />
                            {question.question_type === 'MC' && (question.options || []).length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteOption(question.id, option.id)}
                                className="cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer Configuration */}
                  {question.question_type === 'SA' && (
                    <div className="space-y-3">
                      <Label>Answer Configuration</Label>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Short answer questions are auto-graded based on exact text matches. Configure acceptable answers and matching options.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Acceptable Answers</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const typeData = question.type_specific_data as { acceptable_answers?: string[] } | undefined;
                                const currentAnswers = typeData?.acceptable_answers || [''];
                                updateQuestion(question.id, {
                                  type_specific_data: {
                                    ...question.type_specific_data,
                                    acceptable_answers: [...currentAnswers, '']
                                  }
                                });
                              }}
                              className="cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Answer
                            </Button>
                          </div>
                          
                          {((question.type_specific_data as { acceptable_answers?: string[] })?.acceptable_answers || ['']).map((answer, answerIndex) => (
                            <div key={answerIndex} className="flex items-center gap-2">
                              <Input
                                placeholder={`Acceptable answer ${answerIndex + 1}`}
                                value={answer || ''}
                                onChange={(e) => {
                                  const typeData = question.type_specific_data as { acceptable_answers?: string[] } | undefined;
                                  const answers = [...(typeData?.acceptable_answers || [''])];
                                  answers[answerIndex] = e.target.value;
                                  updateQuestion(question.id, {
                                    type_specific_data: {
                                      ...question.type_specific_data,
                                      acceptable_answers: answers
                                    }
                                  });
                                }}
                                className="flex-1"
                              />
                              {((question.type_specific_data as { acceptable_answers?: string[] })?.acceptable_answers || []).length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const typeData = question.type_specific_data as { acceptable_answers?: string[] } | undefined;
                                    const answers = typeData?.acceptable_answers || [''];
                                    const filteredAnswers = answers.filter((_, i) => i !== answerIndex);
                                    updateQuestion(question.id, {
                                      type_specific_data: {
                                        ...question.type_specific_data,
                                        acceptable_answers: filteredAnswers
                                      }
                                    });
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={(question.type_specific_data as TypeSpecificData)?.case_sensitive || false}
                            onCheckedChange={(checked) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                case_sensitive: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Case sensitive</Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Code Submission Configuration */}
                  {question.question_type === 'CODE' && (
                    <div className="space-y-3">
                      <Label>Code Submission Configuration</Label>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Configure the programming language, expected output, and grading criteria for code submissions.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Programming Language</Label>
                            <Select
                              value={(question.type_specific_data as TypeSpecificData)?.programming_language || 'python'}
                              onValueChange={(value) => updateQuestion(question.id, {
                                type_specific_data: {
                                  ...question.type_specific_data,
                                  programming_language: value
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="go">Go</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Submission Type</Label>
                            <Select
                              value={(question.type_specific_data as TypeSpecificData)?.submission_type || 'code_text'}
                              onValueChange={(value) => updateQuestion(question.id, {
                                type_specific_data: {
                                  ...question.type_specific_data,
                                  submission_type: value
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="code_text">Code Text Area</SelectItem>
                                <SelectItem value="file_upload">File Upload</SelectItem>
                                <SelectItem value="both">Both Text and File</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Expected Output (Optional)</Label>
                          <Textarea
                            placeholder="Expected program output for reference..."
                            value={(question.type_specific_data as TypeSpecificData)?.expected_output || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                expected_output: e.target.value
                              }
                            })}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Starter Code (Optional)</Label>
                          <Textarea
                            placeholder="Initial code template for students..."
                            value={(question.type_specific_data as TypeSpecificData)?.starter_code || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                starter_code: e.target.value
                              }
                            })}
                            rows={5}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={(question.type_specific_data as TypeSpecificData)?.auto_grade || false}
                            onCheckedChange={(checked) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                auto_grade: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Enable automatic grading (requires test cases)</Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Matching Configuration */}
                  {question.question_type === 'MT' && (
                    <div className="space-y-3">
                      <Label>Matching Configuration</Label>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Create pairs of items that students need to match. Each item in the left column should have a corresponding match in the right column.
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Label>Matching Pairs</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentPairs = (question.type_specific_data as TypeSpecificData)?.matching_pairs || [];
                              updateQuestion(question.id, {
                                type_specific_data: {
                                  ...question.type_specific_data,
                                  matching_pairs: [...currentPairs, { left: '', right: '', id: `pair-${Date.now()}` }]
                                }
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Pair
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {((question.type_specific_data as TypeSpecificData)?.matching_pairs || [{ left: '', right: '', id: 'default' }]).map((pair, pairIndex) => (
                            <div key={pair.id || pairIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label className="text-sm">Left Item</Label>
                                <Input
                                  placeholder="Item to match..."
                                  value={pair.left || ''}
                                  onChange={(e) => {
                                    const pairs = [...((question.type_specific_data as TypeSpecificData)?.matching_pairs || [])];
                                    pairs[pairIndex] = { ...pairs[pairIndex], left: e.target.value };
                                    updateQuestion(question.id, {
                                      type_specific_data: {
                                        ...question.type_specific_data,
                                        matching_pairs: pairs
                                      }
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Right Item</Label>
                                  {((question.type_specific_data as TypeSpecificData)?.matching_pairs || []).length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const pairs = (question.type_specific_data as TypeSpecificData)?.matching_pairs || [];
                                        const filteredPairs = pairs.filter((_, i) => i !== pairIndex);
                                        updateQuestion(question.id, {
                                          type_specific_data: {
                                            ...question.type_specific_data,
                                            matching_pairs: filteredPairs
                                          }
                                        });
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <Input
                                  placeholder="Correct match..."
                                  value={pair.right || ''}
                                  onChange={(e) => {
                                    const pairs = [...((question.type_specific_data as TypeSpecificData)?.matching_pairs || [])];
                                    pairs[pairIndex] = { ...pairs[pairIndex], right: e.target.value };
                                    updateQuestion(question.id, {
                                      type_specific_data: {
                                        ...question.type_specific_data,
                                        matching_pairs: pairs
                                      }
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={(question.type_specific_data as TypeSpecificData)?.shuffle_options || true}
                            onCheckedChange={(checked) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                shuffle_options: checked
                              }
                            })}
                          />
                          <Label className="text-sm">Shuffle right column options</Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fill in the Blanks Configuration */}
                  {question.question_type === 'FB' && (
                    <div className="space-y-3">
                      <Label>Fill in the Blanks Configuration</Label>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Create a text with blanks that students need to fill. Use [BLANK] to mark where blanks should appear, then define the correct answers below.
                        </p>

                        <div className="space-y-2">
                          <Label>Text with Blanks</Label>
                          <Textarea
                            placeholder="Enter your text here. Use [BLANK] to indicate where students should fill in answers. Example: The capital of France is [BLANK] and it is located in [BLANK]."
                            value={(question.type_specific_data as TypeSpecificData)?.passage_text || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                passage_text: e.target.value
                              }
                            })}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">
                            Number of [BLANK] placeholders found: {((question.type_specific_data as TypeSpecificData)?.passage_text || '').split('[BLANK]').length - 1}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Blank Answers</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentBlanks = (question.type_specific_data as TypeSpecificData)?.blank_answers || [];
                                updateQuestion(question.id, {
                                  type_specific_data: {
                                    ...question.type_specific_data,
                                    blank_answers: [...currentBlanks, { correct_answers: [''], case_sensitive: false }]
                                  }
                                });
                              }}
                              className="cursor-pointer"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Blank
                            </Button>
                          </div>

                          {((question.type_specific_data as TypeSpecificData)?.blank_answers || []).map((blank, blankIndex) => (
                            <div key={blankIndex} className="p-3 border rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm">Blank {blankIndex + 1}</Label>
                                {((question.type_specific_data as TypeSpecificData)?.blank_answers || []).length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const blanks = (question.type_specific_data as TypeSpecificData)?.blank_answers || [];
                                      const filteredBlanks = blanks.filter((_, i) => i !== blankIndex);
                                      updateQuestion(question.id, {
                                        type_specific_data: {
                                          ...question.type_specific_data,
                                          blank_answers: filteredBlanks
                                        }
                                      });
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Acceptable Answers</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const blanks = [...((question.type_specific_data as TypeSpecificData)?.blank_answers || [])];
                                      blanks[blankIndex] = {
                                        ...blanks[blankIndex],
                                        correct_answers: [...(blanks[blankIndex]?.correct_answers || []), '']
                                      };
                                      updateQuestion(question.id, {
                                        type_specific_data: {
                                          ...question.type_specific_data,
                                          blank_answers: blanks
                                        }
                                      });
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Answer
                                  </Button>
                                </div>

                                {(blank.correct_answers || ['']).map((answer, answerIndex) => (
                                  <div key={answerIndex} className="flex items-center gap-2">
                                    <Input
                                      placeholder={`Answer ${answerIndex + 1}`}
                                      value={answer || ''}
                                      onChange={(e) => {
                                        const blanks = [...((question.type_specific_data as TypeSpecificData)?.blank_answers || [])];
                                        const answers = [...(blanks[blankIndex]?.correct_answers || [''])];
                                        answers[answerIndex] = e.target.value;
                                        blanks[blankIndex] = { ...blanks[blankIndex], correct_answers: answers };
                                        updateQuestion(question.id, {
                                          type_specific_data: {
                                            ...question.type_specific_data,
                                            blank_answers: blanks
                                          }
                                        });
                                      }}
                                      className="flex-1"
                                    />
                                    {(blank.correct_answers || []).length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const blanks = [...((question.type_specific_data as TypeSpecificData)?.blank_answers || [])];
                                          const answers = blanks[blankIndex]?.correct_answers || [''];
                                          const filteredAnswers = answers.filter((_, i) => i !== answerIndex);
                                          blanks[blankIndex] = { ...blanks[blankIndex], correct_answers: filteredAnswers };
                                          updateQuestion(question.id, {
                                            type_specific_data: {
                                              ...question.type_specific_data,
                                              blank_answers: blanks
                                            }
                                          });
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={blank.case_sensitive || false}
                                  onCheckedChange={(checked) => {
                                    const blanks = [...((question.type_specific_data as TypeSpecificData)?.blank_answers || [])];
                                    blanks[blankIndex] = { ...blanks[blankIndex], case_sensitive: checked };
                                    updateQuestion(question.id, {
                                      type_specific_data: {
                                        ...question.type_specific_data,
                                        blank_answers: blanks
                                      }
                                    });
                                  }}
                                />
                                <Label className="text-xs">Case sensitive</Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Essay Question Configuration */}
                  {question.question_type === 'ES' && (
                    <div className="space-y-3">
                      <Label>Essay Configuration</Label>
                      <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Essay questions require manual grading. Configure word limits and grading criteria to help with assessment.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum Words (Optional)</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 100"
                              value={(question.type_specific_data as TypeSpecificData)?.min_words || ''}
                              onChange={(e) => updateQuestion(question.id, {
                                type_specific_data: {
                                  ...question.type_specific_data,
                                  min_words: e.target.value ? parseInt(e.target.value) : undefined
                                }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Maximum Words (Optional)</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 500"
                              value={(question.type_specific_data as TypeSpecificData)?.max_words || ''}
                              onChange={(e) => updateQuestion(question.id, {
                                type_specific_data: {
                                  ...question.type_specific_data,
                                  max_words: e.target.value ? parseInt(e.target.value) : undefined
                                }
                              })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Grading Rubric (Optional)</Label>
                          <Textarea
                            placeholder="Describe the grading criteria, key points to look for, or provide a rubric..."
                            value={(question.type_specific_data as TypeSpecificData)?.grading_rubric || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                grading_rubric: e.target.value
                              }
                            })}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Sample Answer (Optional)</Label>
                          <Textarea
                            placeholder="Provide a sample answer or key points that should be covered..."
                            value={(question.type_specific_data as TypeSpecificData)?.sample_answer || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              type_specific_data: {
                                ...question.type_specific_data,
                                sample_answer: e.target.value
                              }
                            })}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(assessment.questions || []).length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first question to this assessment.</p>
                <Button onClick={addQuestion} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Question
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}