'use client';
import { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BookOpen, 
  BarChart3,
  Save,
  Building,
  Mail,
  Phone,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Plus,
  X
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/Alert';

const sidebarItems = [
  { icon: BarChart3, label: 'Overview', href: '/principal/dashboard' },
  { icon: Users, label: 'Teachers', href: '/principal/teachers' },
  { icon: BookOpen, label: 'Analytics', href: '/principal/analytics' },
  { icon: Settings, label: 'Settings', href: '/principal/settings' },
];

interface SchoolSettings {
  name: string;
  address: string;
  departments: string[];
  gradeLevels: string[];
  subjects: string[];
}

interface PrincipalProfile {
  name: string;
  email: string;
  phone: string;
}

export default function SettingsPage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    name: '',
    address: '',
    departments: [],
    gradeLevels: [],
    subjects: [],
  });
  
  const [principalProfile, setPrincipalProfile] = useState<PrincipalProfile>({
    name: '',
    email: '',
    phone: '',
  });

  const [newDepartment, setNewDepartment] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (userData) {
      fetchSettings();
    }
  }, [userData]);

  const fetchSettings = async () => {
    try {
      if (!userData) return;

      // Fetch school settings
      const schoolDoc = await getDoc(doc(db, 'schools', `school_${userData.id}`));
      if (schoolDoc.exists()) {
        const schoolData = schoolDoc.data();
        setSchoolSettings({
          name: schoolData.name || '',
          address: schoolData.address || '',
          departments: schoolData.settings?.departments || [],
          gradeLevels: schoolData.settings?.gradeLevels || [],
          subjects: schoolData.settings?.subjects || [],
        });
      }

      // Set principal profile from userData
      setPrincipalProfile({
        name: (userData as any).name || '',
        email: userData.email,
        phone: (userData as any).phone || '',
      });

    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (!userData) return;

      // Update school settings
      await updateDoc(doc(db, 'schools', `school_${userData.id}`), {
        name: schoolSettings.name,
        address: schoolSettings.address,
        settings: {
          departments: schoolSettings.departments,
          gradeLevels: schoolSettings.gradeLevels,
          subjects: schoolSettings.subjects,
        },
      });

      // Update principal profile
      await updateDoc(doc(db, 'users', userData.id), {
        name: principalProfile.name,
        phone: principalProfile.phone,
        schoolName: schoolSettings.name,
      });

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !schoolSettings.departments.includes(newDepartment.trim())) {
      setSchoolSettings(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()]
      }));
      setNewDepartment('');
    }
  };

  const removeDepartment = (department: string) => {
    setSchoolSettings(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== department)
    }));
  };

  const addSubject = () => {
    if (newSubject.trim() && !schoolSettings.subjects.includes(newSubject.trim())) {
      setSchoolSettings(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setSchoolSettings(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
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
            <h1 className="text-3xl font-bold text-gray-900" data-testid="settings-page-title">
              School Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your school configuration and preferences
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="gradient-primary text-white"
            data-testid="save-settings-button"
          >
            {saving ? (
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
          {/* Principal Profile */}
          <Card data-testid="principal-profile-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Principal Profile
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={principalProfile.name}
                  onChange={(e) => setPrincipalProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  data-testid="principal-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  value={principalProfile.email}
                  disabled
                  className="bg-gray-50"
                  data-testid="principal-email-input"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  value={principalProfile.phone}
                  onChange={(e) => setPrincipalProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  data-testid="principal-phone-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card data-testid="school-info-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic school details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <Input
                  value={schoolSettings.name}
                  onChange={(e) => setSchoolSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter school name"
                  data-testid="school-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Address
                </label>
                <Input
                  value={schoolSettings.address}
                  onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter school address"
                  data-testid="school-address-input"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Management */}
        <Card data-testid="departments-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Departments
            </CardTitle>
            <CardDescription>
              Manage school departments for teacher organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Add new department"
                onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                data-testid="new-department-input"
              />
              <Button onClick={addDepartment} data-testid="add-department-button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {schoolSettings.departments.map((department) => (
                <div key={department} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm">{department}</span>
                  <button
                    onClick={() => removeDepartment(department)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                    data-testid={`remove-department-${department}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects Management */}
        <Card data-testid="subjects-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Subjects
            </CardTitle>
            <CardDescription>
              Manage subjects taught in your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add new subject"
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                data-testid="new-subject-input"
              />
              <Button onClick={addSubject} data-testid="add-subject-button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {schoolSettings.subjects.map((subject) => (
                <div key={subject} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm">{subject}</span>
                  <button
                    onClick={() => removeSubject(subject)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                    data-testid={`remove-subject-${subject}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grade Levels */}
        <Card data-testid="grade-levels-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Grade Levels
            </CardTitle>
            <CardDescription>
              Current grade levels in your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {schoolSettings.gradeLevels.map((grade) => (
                <div key={grade} className="bg-gray-100 rounded-lg px-3 py-2 text-center text-sm">
                  {grade}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}