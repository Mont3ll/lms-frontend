export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export interface InstructorCourse {
  id: number;
  title: string;
  studentCount: number;
  revenue: number;
  rating: number;
  status: 'draft' | 'published' | 'archived';
}

export interface InstructorDashboardData {
  stats: InstructorStats;
  recentCourses: InstructorCourse[];
  recentEnrollments: Array<{
    id: number;
    studentName: string;
    courseName: string;
    enrolledAt: string;
  }>;
}