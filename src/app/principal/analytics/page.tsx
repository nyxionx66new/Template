'use client';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Clock,
  Target,
  Download,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const sidebarItems = [
  { icon: BarChart3, label: 'Overview', href: '/principal/dashboard' },
  { icon: Users, label: 'Teachers', href: '/principal/teachers' },
  { icon: BookOpen, label: 'Analytics', href: '/principal/analytics' },
  { icon: Settings, label: 'Settings', href: '/principal/settings' },
];

interface AnalyticsData {
  teacherPerformance: any[];
  departmentStats: any[];
  attendanceData: any[];
  trainingProgress: any[];
}

export default function AnalyticsPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    teacherPerformance: [],
    departmentStats: [],
    attendanceData: [],
    trainingProgress: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (userData) {
      fetchAnalyticsData();
    }
  }, [userData, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      if (!userData) return;

      // Fetch teachers data
      const teachersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('schoolId', '==', `school_${userData.id}`)
      );

      const teachersSnapshot = await getDocs(teachersQuery);
      const teachers = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Process teacher performance data
      const performanceData = teachers.map(teacher => ({
        name: teacher.personalInfo?.fullName?.split(' ')[0] || 'Teacher',
        performance: teacher.stats?.performanceScore || 0,
        attendance: teacher.stats?.attendanceRate || 0,
        training: teacher.stats?.trainingCompleted || 0,
      }));

      // Process department statistics
      const departmentMap = new Map();
      teachers.forEach(teacher => {
        const dept = teacher.professionalInfo?.department || 'Unknown';
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, { name: dept, count: 0, avgPerformance: 0, totalPerformance: 0 });
        }
        const deptData = departmentMap.get(dept);
        deptData.count += 1;
        deptData.totalPerformance += teacher.stats?.performanceScore || 0;
        deptData.avgPerformance = deptData.totalPerformance / deptData.count;
      });

      const departmentStats = Array.from(departmentMap.values());

      // Generate mock attendance data for the chart
      const attendanceData = [
        { month: 'Jan', attendance: 95 },
        { month: 'Feb', attendance: 92 },
        { month: 'Mar', attendance: 96 },
        { month: 'Apr', attendance: 94 },
        { month: 'May', attendance: 97 },
        { month: 'Jun', attendance: 93 },
      ];

      // Generate training progress data
      const trainingData = [
        { category: 'Completed', value: teachers.filter(t => (t.stats?.trainingCompleted || 0) > 0).length },
        { category: 'In Progress', value: Math.floor(teachers.length * 0.3) },
        { category: 'Not Started', value: teachers.filter(t => (t.stats?.trainingCompleted || 0) === 0).length },
      ];

      setAnalyticsData({
        teacherPerformance: performanceData,
        departmentStats,
        attendanceData,
        trainingProgress: trainingData,
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];

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
            <h1 className="text-3xl font-bold text-gray-900" data-testid="analytics-page-title">
              School Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your school's performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="period-selector"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button variant="outline" data-testid="export-button">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="avg-performance-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.teacherPerformance.length > 0
                  ? Math.round(analyticsData.teacherPerformance.reduce((sum, t) => sum + t.performance, 0) / analyticsData.teacherPerformance.length)
                  : 0}%
              </div>
              <p className="text-xs text-green-600">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card data-testid="attendance-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.teacherPerformance.length > 0
                  ? Math.round(analyticsData.teacherPerformance.reduce((sum, t) => sum + t.attendance, 0) / analyticsData.teacherPerformance.length)
                  : 0}%
              </div>
              <p className="text-xs text-blue-600">+1.2% from last month</p>
            </CardContent>
          </Card>

          <Card data-testid="training-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.trainingProgress.find(t => t.category === 'Completed')?.value || 0}
              </div>
              <p className="text-xs text-purple-600">Teachers completed training</p>
            </CardContent>
          </Card>

          <Card data-testid="departments-metric">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.departmentStats.length}</div>
              <p className="text-xs text-orange-600">Across your school</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Performance Chart */}
          <Card data-testid="performance-chart">
            <CardHeader>
              <CardTitle>Teacher Performance Overview</CardTitle>
              <CardDescription>Individual teacher performance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.teacherPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card data-testid="department-chart">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Average performance by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgPerformance" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <Card data-testid="attendance-trend-chart">
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
              <CardDescription>Monthly attendance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Training Progress */}
          <Card data-testid="training-progress-chart">
            <CardHeader>
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>Teacher training completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.trainingProgress}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.trainingProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card data-testid="detailed-analytics-table">
          <CardHeader>
            <CardTitle>Detailed Teacher Analytics</CardTitle>
            <CardDescription>Comprehensive view of all teacher metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Teacher</th>
                    <th className="text-left p-2">Performance</th>
                    <th className="text-left p-2">Attendance</th>
                    <th className="text-left p-2">Training</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.teacherPerformance.map((teacher, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{teacher.name}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${teacher.performance}%` }}
                            ></div>
                          </div>
                          <span>{teacher.performance}%</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${teacher.attendance}%` }}
                            ></div>
                          </div>
                          <span>{teacher.attendance}%</span>
                        </div>
                      </td>
                      <td className="p-2">{teacher.training} courses</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          teacher.performance >= 90 
                            ? 'bg-green-100 text-green-800' 
                            : teacher.performance >= 70 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.performance >= 90 ? 'Excellent' : teacher.performance >= 70 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}