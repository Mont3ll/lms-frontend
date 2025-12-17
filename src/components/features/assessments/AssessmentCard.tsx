import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, FileQuestion, Calendar, CheckCircle2, XCircle, PlayCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Assessment } from '@/lib/types';

export interface AssessmentCardProps {
    assessment: Assessment;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
    assessment,
}) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getAttemptStatusBadge = () => {
        const { user_latest_attempt_status, user_has_passed, user_attempts_count } = assessment;
        
        if (!user_attempts_count || user_attempts_count === 0) {
            return (
                <Badge variant="outline" className="gap-1">
                    <PlayCircle className="w-3 h-3" />
                    Not Started
                </Badge>
            );
        }

        if (user_has_passed) {
            return (
                <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Passed
                </Badge>
            );
        }

        if (user_latest_attempt_status === 'IN_PROGRESS') {
            return (
                <Badge variant="default" className="gap-1 bg-yellow-600 hover:bg-yellow-700">
                    <RotateCcw className="w-3 h-3" />
                    In Progress
                </Badge>
            );
        }

        if (user_latest_attempt_status === 'SUBMITTED') {
            return (
                <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Awaiting Grade
                </Badge>
            );
        }

        if (user_latest_attempt_status === 'GRADED' && !user_has_passed) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Not Passed
                </Badge>
            );
        }

        return null;
    };

    const getButtonText = () => {
        const { user_latest_attempt_status, user_attempts_count, user_attempts_remaining } = assessment;
        
        if (user_latest_attempt_status === 'IN_PROGRESS') {
            return 'Continue Attempt';
        }
        
        if (!user_attempts_count || user_attempts_count === 0) {
            return 'Start Assessment';
        }
        
        if (user_attempts_remaining !== undefined && user_attempts_remaining > 0) {
            return 'Retry Assessment';
        }
        
        return 'View Results';
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{assessment.title}</CardTitle>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                        {getAttemptStatusBadge()}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assessment.description || 'No description'}
                </p>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        <Badge variant="outline">{assessment.assessment_type_display}</Badge>
                    </div>

                    {assessment.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formatDate(assessment.due_date)}</span>
                        </div>
                    )}
                    
                    {assessment.time_limit_minutes && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{assessment.time_limit_minutes} minutes</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileQuestion className="w-4 h-4" />
                        <span>{assessment.questions?.length || 0} questions</span>
                    </div>

                    {/* Attempt Progress Section */}
                    {assessment.user_attempts_count !== undefined && (
                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Attempts</span>
                                <span className={cn(
                                    "font-medium",
                                    assessment.user_attempts_remaining === 0 && "text-destructive"
                                )}>
                                    {assessment.user_attempts_count} / {assessment.max_attempts}
                                </span>
                            </div>
                            <Progress 
                                value={(assessment.user_attempts_count / assessment.max_attempts) * 100} 
                                className="h-2"
                            />
                            {assessment.user_best_percentage !== undefined && assessment.user_best_percentage !== null && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Best Score</span>
                                    <span className={cn(
                                        "font-medium",
                                        assessment.user_has_passed ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        {assessment.user_best_percentage}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <Button asChild className="w-full">
                            <Link href={`/learner/assessments/${assessment.id}`}>
                                {getButtonText()}
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
