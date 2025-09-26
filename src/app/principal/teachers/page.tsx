'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  PlusCircle,
  Search,
  Mail,
  Phone,
  Edit,
  Eye,
  Building
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/Alert';

const sidebarItems = [
  { icon: BarChart3, label: 'Overview', href: '/principal/dashboard' },
  { icon: Users, label: 'Teachers', href: '/principal/teachers' },
  { icon: BookOpen, label: 'Analytics', href: '/principal/analytics' },
  { icon: Settings, label: 'Settings', href: '/principal/settings' },
];

// Teacher form validation schema
const teacherSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
  }),
  professionalInfo: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    department: z.string().min(1, 'Department is required'),
    subjects: z.array(z.string()).min(1, 'At least one subject is required'),
    gradeLevels: z.array(z.string()).min(1, 'At least one grade level is required'),
    joiningDate: z.string().min(1, 'Joining date is required'),
    qualifications: z.array(z.string()),
  }),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function TeachersPage() {
  const { userData } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGradeLevels, setSelectedGradeLevels] = useState<string[]>([]);

  // Sample data for form options
  const departments = ['Mathematics', 'Science', 'English', 'Social Studies', 'Physical Education', 'Arts', 'Music'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'English Language', 'History', 'Geography', 'Physical Education', 'Art', 'Music', 'Computer Science'];
  const gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    if (userData) {
      fetchTeachers();
    }
  }, [userData]);

  // Update form values when subjects or grade levels change
  useEffect(() => {
    setValue('professionalInfo.subjects', selectedSubjects);
  }, [selectedSubjects, setValue]);

  useEffect(() => {
    setValue('professionalInfo.gradeLevels', selectedGradeLevels);
  }, [selectedGradeLevels, setValue]);

  const fetchTeachers = async () => {
    try {
      if (!userData) return;

      const teachersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'teacher'),
        where('schoolId', '==', `school_${userData.id}`)
      );

      const snapshot = await getDocs(teachersQuery);
      const teachersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate(),
      }));

      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setMessage({ type: 'error', text: 'Failed to fetch teachers' });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const onSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Generate a temporary password
      const tempPassword = generatePassword();

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.personalInfo.email, tempPassword);
      const user = userCredential.user;

      // Create teacher document
      const teacherDoc = {
        id: user.uid,
        email: data.personalInfo.email,
        role: 'teacher',
        schoolId: `school_${userData?.id}`,
        emailVerified: false,
        personalInfo: {
          ...data.personalInfo,
          dateOfBirth: data.personalInfo.dateOfBirth ? new Date(data.personalInfo.dateOfBirth) : null,
        },
        professionalInfo: {
          ...data.professionalInfo,
          joiningDate: new Date(data.professionalInfo.joiningDate),
        },
        stats: {
          attendanceRate: 0,
          performanceScore: 0,
          trainingCompleted: 0,
          badgesEarned: 0,
          points: 0,
          ranking: null,
        },
        createdBy: userData?.id,
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), teacherDoc);

      // Send password reset email so teacher can set their own password
      await sendPasswordResetEmail(auth, data.personalInfo.email);

      setMessage({ 
        type: 'success', 
        text: `Teacher account created successfully! An email has been sent to ${data.personalInfo.email} with instructions to set their password. Login credentials: Email: ${data.personalInfo.email}, Temporary Password: ${tempPassword} (They should change this immediately)` 
      });

      reset();
      setSelectedSubjects([]);
      setSelectedGradeLevels([]);
      setShowAddForm(false);
      fetchTeachers();

    } catch (error: any) {
      console.error('Error creating teacher:', error);
      let errorMessage = 'Failed to create teacher account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleGradeLevelChange = (gradeLevel: string) => {
    setSelectedGradeLevels(prev => 
      prev.includes(gradeLevel) 
        ? prev.filter(g => g !== gradeLevel)
        : [...prev, gradeLevel]
    );
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.professionalInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900" data-testid="teachers-page-title">
              Teachers Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your school's teaching staff and their accounts
            </p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gradient-primary text-white"
            data-testid="add-teacher-button"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Teacher
          </Button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Add Teacher Form */}
        {showAddForm && (
          <Card data-testid="add-teacher-form">
            <CardHeader>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>
                Create a new teacher account and send them login credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input
                        {...register('personalInfo.fullName')}
                        placeholder="Enter full name"
                        data-testid="teacher-full-name"
                      />
                      {errors.personalInfo?.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.personalInfo.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <Input
                        {...register('personalInfo.email')}
                        type="email"
                        placeholder="Enter email address"
                        data-testid="teacher-email"
                      />
                      {errors.personalInfo?.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.personalInfo.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        {...register('personalInfo.phone')}
                        placeholder="Enter phone number"
                        data-testid="teacher-phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <Input
                        {...register('personalInfo.dateOfBirth')}
                        type="date"
                        data-testid="teacher-dob"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <Input
                        {...register('personalInfo.address')}
                        placeholder="Enter address"
                        data-testid="teacher-address"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                      </label>
                      <Input
                        {...register('professionalInfo.employeeId')}
                        placeholder="Enter employee ID"
                        data-testid="teacher-employee-id"
                      />
                      {errors.professionalInfo?.employeeId && (
                        <p className="text-red-500 text-sm mt-1">{errors.professionalInfo.employeeId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select 
                        {...register('professionalInfo.department')}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        data-testid="teacher-department"
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.professionalInfo?.department && (
                        <p className="text-red-500 text-sm mt-1">{errors.professionalInfo.department.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Joining Date *
                      </label>
                      <Input
                        {...register('professionalInfo.joiningDate')}
                        type="date"
                        data-testid="teacher-joining-date"
                      />
                      {errors.professionalInfo?.joiningDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.professionalInfo.joiningDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects Taught *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((subject) => (
                        <label key={subject} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject)}
                            onChange={() => handleSubjectChange(subject)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{subject}</span>
                        </label>
                      ))}
                    </div>
                    {errors.professionalInfo?.subjects && (
                      <p className="text-red-500 text-sm mt-1">{errors.professionalInfo.subjects.message}</p>
                    )}
                  </div>

                  {/* Grade Levels */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Levels *
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {gradeLevels.map((grade) => (
                        <label key={grade} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedGradeLevels.includes(grade)}
                            onChange={() => handleGradeLevelChange(grade)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{grade}</span>
                        </label>
                      ))}
                    </div>
                    {errors.professionalInfo?.gradeLevels && (
                      <p className="text-red-500 text-sm mt-1">{errors.professionalInfo.gradeLevels.message}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                      setSelectedSubjects([]);
                      setSelectedGradeLevels([]);
                      setMessage({ type: '', text: '' });
                    }}
                    data-testid="cancel-add-teacher"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gradient-primary text-white"
                    data-testid="submit-add-teacher"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Teacher Account'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Teachers List */}
        <Card data-testid="teachers-list-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Teachers ({teachers.length})</CardTitle>
                <CardDescription>
                  Manage and view all teachers in your school
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="search-teachers"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No teachers found' : 'No teachers yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Start by adding your first teacher to begin tracking performance.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="gradient-primary text-white"
                    data-testid="add-first-teacher-button"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Teacher
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {teacher.personalInfo?.fullName || 'No Name'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {teacher.professionalInfo?.department || 'No Department'} • 
                            {teacher.professionalInfo?.employeeId || 'No ID'}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-xs text-gray-500">
                              <Mail className="w-3 h-3 mr-1" />
                              {teacher.personalInfo?.email || 'No Email'}
                            </span>
                            {teacher.personalInfo?.phone && (
                              <span className="flex items-center text-xs text-gray-500">
                                <Phone className="w-3 h-3 mr-1" />
                                {teacher.personalInfo.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-gray-900">
                            {teacher.stats?.performanceScore || 0}%
                          </p>
                          <p className="text-xs text-gray-500">Performance</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-xs text-gray-500">
                            {teacher.lastLogin ? 'Active' : 'Not logged in'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {teacher.lastLogin 
                              ? teacher.lastLogin.toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`view-teacher-${teacher.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}