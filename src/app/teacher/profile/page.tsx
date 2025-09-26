'use client';
import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  Edit
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/Alert';

const sidebarItems = [
  { icon: TrendingUp, label: 'Overview', href: '/teacher/dashboard' },
  { icon: User, label: 'My Profile', href: '/teacher/profile' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance' },
  { icon: BookOpen, label: 'Training', href: '/teacher/training' },
  { icon: Award, label: 'Achievements', href: '/teacher/achievements' },
];

export default function TeacherProfile() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
    },
    professionalInfo: {
      employeeId: '',
      department: '',
      subjects: [] as string[],
      gradeLevels: [] as string[],
      joiningDate: '',
      qualifications: [] as string[],
    },
  });

  useEffect(() => {
    if (userData) {
      const teacherData = userData as any;
      setProfileData({
        personalInfo: {
          fullName: teacherData.personalInfo?.fullName || '',
          email: teacherData.personalInfo?.email || teacherData.email || '',
          phone: teacherData.personalInfo?.phone || '',
          dateOfBirth: teacherData.personalInfo?.dateOfBirth 
            ? new Date(teacherData.personalInfo.dateOfBirth).toISOString().split('T')[0] 
            : '',
          address: teacherData.personalInfo?.address || '',
        },
        professionalInfo: {
          employeeId: teacherData.professionalInfo?.employeeId || '',
          department: teacherData.professionalInfo?.department || '',
          subjects: teacherData.professionalInfo?.subjects || [],
          gradeLevels: teacherData.professionalInfo?.gradeLevels || [],
          joiningDate: teacherData.professionalInfo?.joiningDate 
            ? new Date(teacherData.professionalInfo.joiningDate).toISOString().split('T')[0] 
            : '',
          qualifications: teacherData.professionalInfo?.qualifications || [],
        },
      });
    }
  }, [userData]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!userData) return;

      await updateDoc(doc(db, 'users', userData.id), {
        personalInfo: {
          ...profileData.personalInfo,
          dateOfBirth: profileData.personalInfo.dateOfBirth 
            ? new Date(profileData.personalInfo.dateOfBirth) 
            : null,
        },
        professionalInfo: {
          ...profileData.professionalInfo,
          joiningDate: profileData.professionalInfo.joiningDate 
            ? new Date(profileData.professionalInfo.joiningDate) 
            : null,
        },
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: 'personalInfo' | 'professionalInfo', field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="teacher">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="profile-page-title">
              My Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your personal and professional information
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {editing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setEditing(false)}
                  data-testid="cancel-edit-button"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="gradient-primary text-white"
                  data-testid="save-profile-button"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setEditing(true)}
                className="gradient-primary text-white"
                data-testid="edit-profile-button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card data-testid="personal-info-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {editing ? (
                  <Input
                    value={profileData.personalInfo.fullName}
                    onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                    data-testid="edit-full-name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profileData.personalInfo.fullName || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{profileData.personalInfo.email}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {editing ? (
                  <Input
                    value={profileData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    data-testid="edit-phone"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{profileData.personalInfo.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                {editing ? (
                  <Input
                    type="date"
                    value={profileData.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    data-testid="edit-dob"
                  />
                ) : (
                  <p className="text-gray-900 py-2">
                    {profileData.personalInfo.dateOfBirth 
                      ? new Date(profileData.personalInfo.dateOfBirth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {editing ? (
                  <Input
                    value={profileData.personalInfo.address}
                    onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                    data-testid="edit-address"
                  />
                ) : (
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-gray-900">{profileData.personalInfo.address || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card data-testid="professional-info-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your work-related details and qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <p className="text-gray-900 py-2">{profileData.professionalInfo.employeeId || 'Not assigned'}</p>
                <p className="text-xs text-gray-500">Contact your principal to update</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-gray-900 py-2">{profileData.professionalInfo.department || 'Not assigned'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects Taught
                </label>
                <div className="flex flex-wrap gap-2 py-2">
                  {profileData.professionalInfo.subjects.length > 0 ? (
                    profileData.professionalInfo.subjects.map((subject) => (
                      <span key={subject} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No subjects assigned</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Levels
                </label>
                <div className="flex flex-wrap gap-2 py-2">
                  {profileData.professionalInfo.gradeLevels.length > 0 ? (
                    profileData.professionalInfo.gradeLevels.map((grade) => (
                      <span key={grade} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {grade}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No grade levels assigned</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <p className="text-gray-900 py-2">
                  {profileData.professionalInfo.joiningDate 
                    ? new Date(profileData.professionalInfo.joiningDate).toLocaleDateString()
                    : 'Not provided'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications
                </label>
                <div className="space-y-2 py-2">
                  {profileData.professionalInfo.qualifications.length > 0 ? (
                    profileData.professionalInfo.qualifications.map((qualification, index) => (
                      <div key={index} className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{qualification}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No qualifications listed</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card data-testid="performance-summary-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Your current performance metrics and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {(userData as any)?.stats?.performanceScore || 0}%
                </div>
                <p className="text-sm text-gray-600">Performance Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(userData as any)?.stats?.attendanceRate || 0}%
                </div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {(userData as any)?.stats?.trainingCompleted || 0}
                </div>
                <p className="text-sm text-gray-600">Training Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {(userData as any)?.stats?.points || 0}
                </div>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}