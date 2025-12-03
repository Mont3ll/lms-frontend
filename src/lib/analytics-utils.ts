// Analytics utility functions

/**
 * Format a number as a percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with commas for thousands separator
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Get trend indicator (up, down, stable)
 */
export function getTrendIndicator(current: number, previous: number): 'up' | 'down' | 'stable' {
  const change = calculatePercentageChange(current, previous);
  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'up' : 'down';
}

/**
 * Format date for analytics display
 */
export function formatAnalyticsDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate average from an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

/**
 * Get performance level based on score
 */
export function getPerformanceLevel(score: number): {
  label: string;
  color: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600', variant: 'default' };
  if (score >= 80) return { label: 'Good', color: 'text-blue-600', variant: 'default' };
  if (score >= 70) return { label: 'Satisfactory', color: 'text-yellow-600', variant: 'secondary' };
  if (score >= 60) return { label: 'Needs Improvement', color: 'text-orange-600', variant: 'secondary' };
  return { label: 'Poor', color: 'text-red-600', variant: 'destructive' };
}

/**
 * Calculate engagement score based on multiple factors
 */
export function calculateEngagementScore(
  timeSpent: number,
  activitiesCompleted: number,
  totalActivities: number,
  forumParticipation: number
): number {
  const completionRate = calculateCompletionRate(activitiesCompleted, totalActivities);
  const timeScore = Math.min(timeSpent / 60, 100); // Cap at 100 for 1 hour
  const forumScore = Math.min(forumParticipation * 10, 100); // Cap at 100
  
  return (completionRate * 0.4 + timeScore * 0.3 + forumScore * 0.3);
}

/**
 * Generate color palette for charts
 */
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...baseColors, ...additionalColors];
}

/**
 * Sort analytics data by various criteria
 */
export function sortAnalyticsData<T extends Record<string, unknown>>(
  data: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
}

/**
 * Filter analytics data by date range
 */
export function filterByDateRange<T extends { date: string | Date }>(
  data: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Group analytics data by time period
 */
export function groupByTimePeriod<T extends { date: string | Date }>(
  data: T[],
  period: 'day' | 'week' | 'month'
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  
  return groups;
}