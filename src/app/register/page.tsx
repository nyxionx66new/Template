'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { 
  BookOpen, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

// Validation schema
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, currentUser, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (currentUser && userData) {
      if (userData.role === 'principal') {
        router.push('/principal/dashboard');
      } else if (userData.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
    }
  }, [currentUser, userData, router]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await register(data.email, data.password, {
        name: data.name,
        schoolName: data.schoolName,
        phone: data.phone,
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?message=verification-sent');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification email to your address. Please check your email and click the verification link to activate your account.
            </p>
            <p className="text-sm text-gray-500">
              You'll be redirected to the login page shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">EduTracker</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Start managing your school's performance today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Principal Registration</CardTitle>
            <CardDescription>
              Register as a principal to create and manage teacher accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start" data-testid="error-message">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('name')}
                    className="pl-10"
                    placeholder="Enter your full name"
                    data-testid="name-input"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('email')}
                    type="email"
                    className="pl-10"
                    placeholder="Enter your email address"
                    data-testid="email-input"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* School Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('schoolName')}
                    className="pl-10"
                    placeholder="Enter your school name"
                    data-testid="school-name-input"
                  />
                </div>
                {errors.schoolName && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('phone')}
                    type="tel"
                    className="pl-10"
                    placeholder="Enter your phone number"
                    data-testid="phone-input"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="Create a password"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                    data-testid="confirm-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    data-testid="toggle-confirm-password-visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>.
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                size="lg"
                disabled={isLoading}
                data-testid="register-button"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                  data-testid="login-link"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 EduTracker. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}