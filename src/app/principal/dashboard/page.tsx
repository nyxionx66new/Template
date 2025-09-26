'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  PlusCircle,
  TrendingUp,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const sidebarItems = [
  { icon: BarChart3, label: 'Overview', href: '/principal/dashboard' },
  { icon: Users, label: 'Teachers', href: '/principal/teachers' },
  { icon: BookOpen, label: 'Analytics', href: '/principal/analytics' },
  { icon: Settings, label: 'Settings', href: '/principal/settings' },
];

interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  averagePerformance: number;
  monthlyGrowth: number;
}

export default function PrincipalDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    averagePerformance: 0,
    monthlyGrowth: 0,
  });
  interface Teacher {
    id: string;
    lastLogin?: { toDate: () => Date };
    personalInfo?: { fullName?: string };
    professionalInfo?: { department?: string };
    stats?: { performanceScore?: number };
    // Add other properties as needed
  }

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      if (!userData) return;

      // Fetch teachers for this principal's school
      const teachersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('schoolId', '==', `school_${userData.id}`),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersData = teachersSnapshot.docs.map(
        doc => {
          const data = doc.data() as Teacher;
          const { id, ...rest } = data;
          return {
            ...rest,
            id: doc.id,
          };
        }
      );

      setTeachers(teachersData);

      // Get total count of teachers
      const totalTeachersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('schoolId', '==', `school_${userData.id}`)
      );
      const totalSnapshot = await getCountFromServer(totalTeachersQuery);
      
      // Calculate active teachers (those who have logged in recently)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const activeTeachers = teachersData.filter(teacher => {
        const lastLogin = teacher.lastLogin?.toDate();
        return lastLogin && lastLogin > weekAgo;
      }).length;

      // Calculate average performance from actual data
      const performanceScores = teachersData
        .map(teacher => teacher.stats?.performanceScore || 0)
        .filter(score => score > 0);
      
      const avgPerformance = performanceScores.length > 0 
        ? performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length
        : 0;

      setStats({
        totalTeachers: totalSnapshot.data().count,
        activeTeachers,
        averagePerformance: Number(avgPerformance.toFixed(1)),
        monthlyGrowth: 0, // This would need historical data to calculate
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="principal">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner w-8 h-8"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="principal">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
              Welcome back, {(userData as any)?.name || 'Principal'}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening at your school today
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/principal/teachers">
              <Button 
                className="gradient-primary text-white"
                data-testid="add-teacher-button"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="total-teachers-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Registered in your school
              </p>
            </CardContent>
          </Card>

          <Card data-testid="active-teachers-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Active in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card data-testid="average-performance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averagePerformance > 0 ? `${stats.averagePerformance}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on current data
              </p>
            </CardContent>
          </Card>

          <Card data-testid="school-info-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">School</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-indigo-600">
                {(userData as any)?.schoolName || 'School Name'}
              </div>
              <p className="text-xs text-muted-foreground">
                Your institution
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Teachers */}
          <Card data-testid="recent-teachers-card">
            <CardHeader>
              <CardTitle>Recent Teachers</CardTitle>
              <CardDescription>
                Latest teacher registrations and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teachers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding your first teacher to begin tracking performance.
                  </p>
                  <Link href="/principal/teachers">
                    <Button className="gradient-primary text-white" data-testid="add-first-teacher-button">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Teacher
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {teacher.personalInfo?.fullName || 'Teacher'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {teacher.professionalInfo?.department || 'No Department'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900 font-medium">
                          {teacher.stats?.performanceScore || 'N/A'}
                          {teacher.stats?.performanceScore ? '%' : ''}
                        </p>
                        <p className="text-xs text-gray-500">Performance</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/principal/teachers">
                    <Button variant="outline" className="w-full mt-4" data-testid="view-all-teachers-button">
                      View All Teachers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Link href="/principal/teachers">
                  <Button variant="outline" className="justify-start h-auto p-4 w-full" data-testid="add-teacher-action">
                    <div className="flex items-center">
                      <PlusCircle className="mr-3 h-5 w-5 text-indigo-600" />
                      <div className="text-left">
                        <p className="font-medium">Add New Teacher</p>
                        <p className="text-sm text-gray-600">Create teacher account and set up profile</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/principal/analytics">
                  <Button variant="outline" className="justify-start h-auto p-4 w-full" data-testid="view-analytics-action">
                    <div className="flex items-center">
                      <BarChart3 className="mr-3 h-5 w-5 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">View Analytics</p>
                        <p className="text-sm text-gray-600">School performance insights and reports</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/principal/settings">
                  <Button variant="outline" className="justify-start h-auto p-4 w-full" data-testid="manage-settings-action">
                    <div className="flex items-center">
                      <Settings className="mr-3 h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium">Manage Settings</p>
                        <p className="text-sm text-gray-600">School configuration and preferences</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        {stats.totalTeachers === 0 && (
          <Card className="border-indigo-200 bg-indigo-50" data-testid="getting-started-card">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-900">
                <BookOpen className="mr-2 h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Follow these steps to set up your school's performance tracking system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-900">Add Your First Teacher</h4>
                    <p className="text-indigo-700 text-sm">
                      Create teacher accounts and send them their login credentials
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Configure School Settings</h4>
                    <p className="text-gray-600 text-sm">
                      Set up departments, subjects, and performance criteria
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Start Tracking Performance</h4>
                    <p className="text-gray-600 text-sm">
                      Begin collecting data and insights on teaching effectiveness
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}