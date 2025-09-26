'use client';
import { useState } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp,
  Play,
  Clock,
  CheckCircle,
  Star
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

export default function TeacherTraining() {
  const { userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock training data
  const trainingCourses = [
    {
      id: 1,
      title: 'Modern Teaching Methodologies',
      description: 'Learn the latest teaching techniques and methodologies for effective classroom management.',
      duration: 8,
      level: 'intermediate',
      category: 'pedagogy',
      progress: 75,
      enrolled: true,
      rating: 4.8,
      instructor: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      title: 'Digital Classroom Tools',
      description: 'Master digital tools and technologies to enhance your teaching experience.',
      duration: 6,
      level: 'beginner',
      category: 'technology',
      progress: 0,
      enrolled: false,
      rating: 4.6,
      instructor: 'Prof. Michael Chen'
    },
    {
      id: 3,
      title: 'Student Assessment Strategies',
      description: 'Develop effective assessment methods to evaluate student progress accurately.',
      duration: 10,
      level: 'advanced',
      category: 'assessment',
      progress: 100,
      enrolled: true,
      rating: 4.9,
      instructor: 'Dr. Emily Rodriguez'
    },
    {
      id: 4,
      title: 'Inclusive Education Practices',
      description: 'Create an inclusive learning environment for students with diverse needs.',
      duration: 12,
      level: 'intermediate',
      category: 'inclusion',
      progress: 30,
      enrolled: true,
      rating: 4.7,
      instructor: 'Dr. James Wilson'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Courses' },
    { value: 'pedagogy', label: 'Pedagogy' },
    { value: 'technology', label: 'Technology' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'inclusion', label: 'Inclusion' }
  ];

  const filteredCourses = selectedCategory === 'all' 
    ? trainingCourses 
    : trainingCourses.filter(course => course.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
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
          <h1 className="text-3xl font-bold text-gray-900" data-testid="training-page-title">
            Professional Training
          </h1>
          <p className="text-gray-600 mt-1">
            Enhance your skills with our comprehensive training programs
          </p>
        </div>

        {/* Training Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="completed-courses-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(userData as any)?.stats?.trainingCompleted || 0}
              </div>
              <p className="text-xs text-gray-600">Total completed</p>
            </CardContent>
          </Card>

          <Card data-testid="in-progress-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {trainingCourses.filter(c => c.enrolled && c.progress > 0 && c.progress < 100).length}
              </div>
              <p className="text-xs text-gray-600">Currently learning</p>
            </CardContent>
          </Card>

          <Card data-testid="total-hours-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {trainingCourses.filter(c => c.enrolled).reduce((sum, c) => sum + c.duration, 0)}
              </div>
              <p className="text-xs text-gray-600">Learning hours</p>
            </CardContent>
          </Card>

          <Card data-testid="certificates-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {trainingCourses.filter(c => c.progress === 100).length}
              </div>
              <p className="text-xs text-gray-600">Earned certificates</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card data-testid="category-filter-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "gradient-primary text-white" : ""}
                  data-testid={`category-${category.value}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow" data-testid={`course-${course.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Course Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration} hours
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Instructor: {course.instructor}
                  </p>

                  {/* Progress Bar (if enrolled) */}
                  {course.enrolled && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {course.progress === 100 ? (
                      <Button variant="outline" className="w-full" data-testid={`view-certificate-${course.id}`}>
                        <Award className="mr-2 h-4 w-4" />
                        View Certificate
                      </Button>
                    ) : course.enrolled ? (
                      <Button className="w-full gradient-primary text-white" data-testid={`continue-course-${course.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" data-testid={`enroll-course-${course.id}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Courses Message */}
        {filteredCourses.length === 0 && (
          <Card data-testid="no-courses-card">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600 mb-4">
                No training courses available in the selected category.
              </p>
              <Button 
                onClick={() => setSelectedCategory('all')}
                className="gradient-primary text-white"
                data-testid="view-all-courses-button"
              >
                View All Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}