'use client';
import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock,
  Target,
  Star,
  CheckCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const sidebarItems = [
  { icon: TrendingUp, label: 'Overview', href: '/teacher/dashboard' },
  { icon: User, label: 'My Profile', href: '/teacher/profile' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance' },
  { icon: BookOpen, label: 'Training', href: '/teacher/training' },
  { icon: Star, label: 'Feedback', href: '/teacher/feedback' },
  { icon: Award, label: 'Achievements', href: '/teacher/achievements' },
];

interface TeacherStats {
  attendanceRate: number;
  performanceScore: number;
  trainingCompleted: number;
  badgesEarned: number;
  points: number;
  ranking?: number;
}

export default function TeacherDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    attendanceRate: 0,
    performanceScore: 0,
    trainingCompleted: 0,
    badgesEarned: 0,
    points: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [upcomingTraining, setUpcomingTraining] = useState<any[]>([]);
  
  const motivationalQuotes = [
    "Excellence is not a skill, it's an attitude. - Ralph Marston",
    "Teaching is the profession that teaches all other professions.",
    "A teacher affects eternity; they can never tell where their influence stops. - Henry Adams",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "Good teachers know how to bring out the best in students. - Charles Kuralt"
  ];
  
  const [motivationalQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
      updateLastLogin();
    }
  }, [userData]);

  const updateLastLogin = async () => {
    if (userData) {
      try {
        await updateDoc(doc(db, 'users', userData.id), {
          lastLogin: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!userData) return;

      // Get teacher's current stats from their user document
      const teacherStats = (userData as any).stats || {
        attendanceRate: 0,
        performanceScore: 0,
        trainingCompleted: 0,
        badgesEarned: 0,
        points: 0,
      };

      setStats(teacherStats);

      // Fetch recent feedback
      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('teacherId', '==', userData.id),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecentFeedback(feedbackData);

      // Fetch available training courses
      const trainingQuery = query(
        collection(db, 'trainings'),
        where('schoolId', '==', userData.schoolId),
        limit(3)
      );

      const trainingSnapshot = await getDocs(trainingQuery);
      const trainingData = trainingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUpcomingTraining(trainingData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="teacher">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner w-8 h-8"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="teacher">
      <div className="p-6 space-y-6">
        {/* Header with Motivational Quote */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-greeting">
            Good morning, {(userData as any)?.personalInfo?.fullName?.split(' ')[0] || 'Teacher'}! 👋
          </h1>
          <p className="text-indigo-100 italic text-lg">"{motivationalQuote}"</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-green-50 border-green-200" data-testid="attendance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.attendanceRate > 0 ? `${stats.attendanceRate}%` : 'N/A'}
              </div>
              <p className="text-xs text-green-600">
                {stats.attendanceRate >= 95 ? 'Excellent!' : stats.attendanceRate >= 90 ? 'Good' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200" data-testid="performance-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Performance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.performanceScore > 0 ? `${stats.performanceScore}%` : 'N/A'}
              </div>
              <p className="text-xs text-blue-600">
                Based on evaluations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200" data-testid="training-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Training Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.trainingCompleted}</div>
              <p className="text-xs text-purple-600">
                Courses completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200" data-testid="points-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Points Earned</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.points}</div>
              <p className="text-xs text-yellow-600">
                {stats.ranking ? `Rank #${stats.ranking}` : 'Keep earning!'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Feedback */}
          <Card data-testid="recent-feedback-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Recent Feedback
              </CardTitle>
              <CardDescription>
                Latest evaluations and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Your feedback and evaluations will appear here once they are submitted.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {feedback.type} Feedback
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{feedback.comment}</p>
                    </div>
                  ))}
                  <Link href="/teacher/feedback">
                    <Button variant="outline" className="w-full mt-4" data-testid="view-all-feedback-button">
                      View All Feedback
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Training */}
          <Card data-testid="available-training-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Available Training
              </CardTitle>
              <CardDescription>
                Enhance your skills with these courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTraining.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Available</h3>
                  <p className="text-gray-600 mb-4">
                    Training courses will be available once your principal adds them to the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTraining.map((training) => (
                    <div key={training.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <h4 className="font-medium text-gray-900">{training.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{training.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {training.duration} hours
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {training.skillLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link href="/teacher/training">
                    <Button className="w-full gradient-primary text-white mt-4" data-testid="browse-training-button">
                      Browse All Training
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Professional Info Summary */}
        <Card data-testid="professional-info-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Your current role and department information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Department</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {(userData as any)?.professionalInfo?.department || 'Not specified'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Employee ID</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {(userData as any)?.professionalInfo?.employeeId || 'Not specified'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Subjects</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {(userData as any)?.professionalInfo?.subjects?.join(', ') || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link href="/teacher/profile">
                <Button variant="outline" data-testid="update-profile-button">
                  Update Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}