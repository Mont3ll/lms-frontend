import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileQuestion, Calendar } from 'lucide-react';
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

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{assessment.title}</CardTitle>
                    <Badge variant={assessment.is_published ? 'default' : 'secondary'}>
                        {assessment.is_published ? 'Published' : 'Draft'}
                    </Badge>
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
                    
                    <div className="text-sm text-muted-foreground">
                        Max attempts: {assessment.max_attempts}
                    </div>
                    
                    <div className="pt-2">
                        <Button asChild className="w-full">
                            <Link href={`/learner/assessments/${assessment.id}`}>
                                View Assessment
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
