'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface AnalyticsFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  courseId: string;
  studentId: string;
  metric: string;
  period: 'day' | 'week' | 'month';
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  courses: Array<{ id: string; name: string }>;
  students: Array<{ id: string; name: string }>;
}

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  courses,
  students,
}: AnalyticsFiltersProps) {
  const updateFilter = (key: keyof AnalyticsFilters, value: AnalyticsFilters[keyof AnalyticsFilters]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: { from: null, to: null },
      courseId: '',
      studentId: '',
      metric: '',
      period: 'week',
    });
  };

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.courseId ||
    filters.studentId ||
    filters.metric;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Date Range */}
          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, 'PPP')
                    ) : (
                      <span>From date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from ?? undefined}
                    onSelect={(date) =>
                      updateFilter('dateRange', { ...filters.dateRange, from: date ?? null })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateRange.to && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, 'PPP')
                    ) : (
                      <span>To date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to ?? undefined}
                    onSelect={(date) =>
                      updateFilter('dateRange', { ...filters.dateRange, to: date ?? null })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={filters.courseId}
              onValueChange={(value) => updateFilter('courseId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Filter */}
          <div className="space-y-2">
            <Label>Student</Label>
            <Select
              value={filters.studentId}
              onValueChange={(value) => updateFilter('studentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metric Filter */}
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              value={filters.metric}
              onValueChange={(value) => updateFilter('metric', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All metrics</SelectItem>
                <SelectItem value="completion">Completion Rate</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="time">Time Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period Filter */}
          <div className="space-y-2">
            <Label>Period</Label>
            <Select
              value={filters.period}
              onValueChange={(value: 'day' | 'week' | 'month') => updateFilter('period', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}