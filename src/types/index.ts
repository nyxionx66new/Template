// User Types
export interface User {
  id: string;
  email: string;
  role: 'principal' | 'teacher';
  schoolId: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Principal extends User {
  role: 'principal';
  name: string;
  phone?: string;
  schoolName: string;
}

export interface Teacher extends User {
  role: 'teacher';
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: string;
  };
  professionalInfo: {
    employeeId: string;
    department: string;
    subjects: string[];
    gradeLevels: string[];
    joiningDate: Date;
    qualifications: string[];
  };
  stats: {
    attendanceRate: number;
    performanceScore: number;
    trainingCompleted: number;
    badgesEarned: number;
    points: number;
    ranking?: number;
  };
  createdBy: string; // Principal ID
}

// School Types
export interface School {
  id: string;
  name: string;
  address: string;
  principalId: string;
  settings: {
    departments: string[];
    gradeLevels: string[];
    subjects: string[];
  };
  createdAt: Date;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  teacherId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half-day';
  schoolId: string;
}

// Training Types
export interface Training {
  id: string;
  title: string;
  description: string;
  duration: number; // in hours
  department?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  createdBy: string;
  schoolId: string;
  createdAt: Date;
}

export interface TrainingEnrollment {
  id: string;
  teacherId: string;
  trainingId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  certificateUrl?: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  teacherId: string;
  fromUserId: string;
  fromRole: 'principal' | 'teacher' | 'student';
  type: 'performance' | 'behavior' | 'skills' | 'general';
  rating: number; // 1-5
  comment: string;
  categories: {
    teaching: number;
    communication: number;
    punctuality: number;
    teamwork: number;
  };
  createdAt: Date;
  acknowledged: boolean;
  schoolId: string;
}

// Lesson Plan Types
export interface LessonPlan {
  id: string;
  teacherId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: string[];
  assessment: string;
  fileUrls: string[];
  shared: boolean;
  createdAt: Date;
  schoolId: string;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'attendance' | 'performance' | 'training' | 'leadership';
  criteria: string;
  points: number;
}

export interface TeacherBadge {
  id: string;
  teacherId: string;
  badgeId: string;
  earnedAt: Date;
  schoolId: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  id: string;
  teacherId: string;
  month: number;
  year: number;
  metrics: {
    attendanceRate: number;
    punctualityScore: number;
    studentFeedbackAvg: number;
    peerFeedbackAvg: number;
    trainingHours: number;
    lessonsCompleted: number;
  };
  overallScore: number;
  schoolId: string;
}

// Form Types
export interface TeacherFormData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
  };
  professionalInfo: {
    employeeId: string;
    department: string;
    subjects: string[];
    gradeLevels: string[];
    joiningDate: string;
    qualifications: string[];
  };
}

export interface PrincipalRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  schoolName: string;
  phone?: string;
}