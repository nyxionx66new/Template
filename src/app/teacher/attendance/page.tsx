'use client';
import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { icon: TrendingUp, label: 'Overview', href: '/teacher/dashboard' },
  { icon: User, label: 'My Profile', href: '/teacher/profile' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance' },
  { icon: BookOpen, label: 'Training', href: '/teacher/training' },
  { icon: Award, label: 'Achievements', href: '/teacher/achievements' },
];

export default function TeacherAttendance() {
  const { userData } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock attendance data - in real app, this would come from Firebase
  const attendanceData = [
    { date: '2025-01-15', status: 'present', checkIn: '08:30', checkOut: '16:45' },
    { date: '2025-01-14', status: 'present', checkIn: '08:25', checkOut: '16:50' },
    { date: '2025-01-13', status: 'late', checkIn: '09:15', checkOut: '16:45' },
    { date: '2025-01-12', status: 'present', checkIn: '08:20', checkOut: '16:40' },
    { date: '2025-01-11', status: 'absent', checkIn: null, checkOut: null },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'late':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="teacher">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="attendance-page-title">
            Attendance Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Track your daily attendance and view your attendance history
          </p>
        </div>

        {/* Current Time and Check-in */}
        <Card data-testid="check-in-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Today's Attendance
            </CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {currentTime.toLocaleTimeString()}
                </div>
                <p className="text-gray-600">Current Time</p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="check-in-button"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check In
                </Button>
                <Button 
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  data-testid="check-out-button"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="attendance-rate-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(userData as any)?.stats?.attendanceRate || 0}%
              </div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card data-testid="present-days-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-gray-600">Out of 20 days</p>
            </CardContent>
          </Card>

          <Card data-testid="late-days-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card data-testid="absent-days-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card data-testid="attendance-history-card">
          <CardHeader>
            <CardTitle>Recent Attendance History</CardTitle>
            <CardDescription>
              Your attendance records for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceData.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{record.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {record.checkIn && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Check In</p>
                        <p className="text-xs text-gray-600">{record.checkIn}</p>
                      </div>
                    )}
                    {record.checkOut && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Check Out</p>
                        <p className="text-xs text-gray-600">{record.checkOut}</p>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Calendar View */}
        <Card data-testid="calendar-view-card">
          <CardHeader>
            <CardTitle>Monthly Calendar</CardTitle>
            <CardDescription>
              Visual overview of your attendance for January 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View Coming Soon</h3>
              <p className="text-gray-600">
                Interactive calendar view will be available in the next update
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}