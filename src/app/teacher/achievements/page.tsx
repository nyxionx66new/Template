'use client';
import { useState } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp,
  Star,
  Trophy,
  Medal,
  Target,
  Zap
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

export default function TeacherAchievements() {
  const { userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock achievements data
  const achievements = [
    {
      id: 1,
      title: 'Perfect Attendance',
      description: 'Maintained 100% attendance for 3 consecutive months',
      icon: Calendar,
      category: 'attendance',
      earned: true,
      earnedDate: '2025-01-10',
      points: 100,
      rarity: 'gold'
    },
    {
      id: 2,
      title: 'Training Champion',
      description: 'Completed 5 professional development courses',
      icon: BookOpen,
      category: 'training',
      earned: true,
      earnedDate: '2025-01-05',
      points: 150,
      rarity: 'gold'
    },
    {
      id: 3,
      title: 'Student Favorite',
      description: 'Received excellent feedback from 95% of students',
      icon: Star,
      category: 'performance',
      earned: false,
      progress: 85,
      points: 200,
      rarity: 'platinum'
    },
    {
      id: 4,
      title: 'Innovation Leader',
      description: 'Implemented 3 new teaching methodologies',
      icon: Zap,
      category: 'innovation',
      earned: true,
      earnedDate: '2024-12-20',
      points: 120,
      rarity: 'silver'
    },
    {
      id: 5,
      title: 'Mentor Master',
      description: 'Successfully mentored 5 new teachers',
      icon: User,
      category: 'leadership',
      earned: false,
      progress: 60,
      points: 180,
      rarity: 'gold'
    },
    {
      id: 6,
      title: 'Performance Excellence',
      description: 'Maintained 90%+ performance score for 6 months',
      icon: Trophy,
      category: 'performance',
      earned: false,
      progress: 40,
      points: 250,
      rarity: 'platinum'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Achievements' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'training', label: 'Training' },
    { value: 'performance', label: 'Performance' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'leadership', label: 'Leadership' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'bronze':
        return 'border-amber-500';
      case 'silver':
        return 'border-gray-400';
      case 'gold':
        return 'border-yellow-500';
      case 'platinum':
        return 'border-purple-500';
      default:
        return 'border-gray-400';
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="teacher">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="achievements-page-title">
            Achievements & Badges
          </h1>
          <p className="text-gray-600 mt-1">
            Track your progress and celebrate your accomplishments
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="total-badges-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {earnedAchievements.length}
              </div>
              <p className="text-xs text-gray-600">Out of {achievements.length}</p>
            </CardContent>
          </Card>

          <Card data-testid="total-points-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalPoints}
              </div>
              <p className="text-xs text-gray-600">Achievement points</p>
            </CardContent>
          </Card>

          <Card data-testid="completion-rate-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((earnedAchievements.length / achievements.length) * 100)}%
              </div>
              <p className="text-xs text-gray-600">Achievements unlocked</p>
            </CardContent>
          </Card>

          <Card data-testid="current-rank-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Trophy className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                #{(userData as any)?.stats?.ranking || 'N/A'}
              </div>
              <p className="text-xs text-gray-600">School ranking</p>
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

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                achievement.earned 
                  ? `border-2 ${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-white to-gray-50` 
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
              data-testid={`achievement-${achievement.id}`}
            >
              {/* Rarity Indicator */}
              {achievement.earned && (
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-20 rounded-bl-full`}></div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  achievement.earned 
                    ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg` 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  <achievement.icon className="h-8 w-8" />
                </div>
                <CardTitle className={`text-lg ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement.title}
                </CardTitle>
                <CardDescription className={achievement.earned ? 'text-gray-600' : 'text-gray-400'}>
                  {achievement.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Progress Bar (for unearned achievements) */}
                  {!achievement.earned && achievement.progress && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Achievement Info */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className={achievement.earned ? 'text-gray-700' : 'text-gray-500'}>
                        {achievement.points} points
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      achievement.earned 
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white` 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  {/* Earned Date */}
                  {achievement.earned && achievement.earnedDate && (
                    <div className="text-center text-xs text-gray-500 pt-2 border-t">
                      Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Achievements Message */}
        {filteredAchievements.length === 0 && (
          <Card data-testid="no-achievements-card">
            <CardContent className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Achievements Found</h3>
              <p className="text-gray-600 mb-4">
                No achievements available in the selected category.
              </p>
              <Button 
                onClick={() => setSelectedCategory('all')}
                className="gradient-primary text-white"
                data-testid="view-all-achievements-button"
              >
                View All Achievements
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Preview */}
        <Card data-testid="leaderboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              School Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank among your colleagues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Sarah Johnson', points: 1250, badge: 'gold' },
                { rank: 2, name: 'Michael Chen', points: 1180, badge: 'silver' },
                { rank: 3, name: 'You', points: totalPoints, badge: 'bronze', isCurrentUser: true },
                { rank: 4, name: 'Emily Rodriguez', points: 980, badge: 'none' },
                { rank: 5, name: 'James Wilson', points: 920, badge: 'none' },
              ].map((teacher) => (
                <div 
                  key={teacher.rank} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    teacher.isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      teacher.rank === 1 ? 'bg-yellow-500 text-white' :
                      teacher.rank === 2 ? 'bg-gray-400 text-white' :
                      teacher.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {teacher.rank}
                    </div>
                    <div>
                      <p className={`font-medium ${teacher.isCurrentUser ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {teacher.name}
                      </p>
                      <p className="text-sm text-gray-600">{teacher.points} points</p>
                    </div>
                  </div>
                  {teacher.badge !== 'none' && (
                    <Medal className={`h-5 w-5 ${
                      teacher.badge === 'gold' ? 'text-yellow-500' :
                      teacher.badge === 'silver' ? 'text-gray-400' :
                      'text-amber-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}