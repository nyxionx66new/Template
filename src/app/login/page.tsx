'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { login, currentUser, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const messageParam = searchParams.get('message');

  useEffect(() => {
    // Redirect if already logged in
    if (currentUser && userData) {
      if (userData.role === 'principal') {
        router.push('/principal/dashboard');
      } else if (userData.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
      return;
    }

    // Handle success messages
    if (messageParam === 'verification-sent') {
      setMessage('Verification email sent! Please check your email and verify your account before logging in.');
    } else if (messageParam === 'verify-email') {
      setMessage('Please verify your email address before accessing your dashboard.');
    } else if (messageParam === 'role-mismatch') {
      setMessage('Please use the correct login page for your account type.');
    }
  }, [currentUser, userData, router, messageParam]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data.email, data.password);
      
      // Check role mismatch after login
      if (userData && role) {
        if (role === 'principal' && userData.role !== 'principal') {
          setError('This account is not a principal account. Please use the teacher login.');
          return;
        } else if (role === 'teacher' && userData.role !== 'teacher') {
          setError('This account is not a teacher account. Please use the principal login.');
          return;
        }
      }
      
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email address.';
      } else if (err.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.message.includes('invalid-login-credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.message.includes('user-disabled')) {
        errorMessage = 'This account has been disabled.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleTitle = () => {
    if (role === 'principal') return 'Principal Login';
    if (role === 'teacher') return 'Teacher Login';
    return 'Login';
  };

  const getRoleDescription = () => {
    if (role === 'principal') return 'Access your principal dashboard to manage teachers and view analytics';
    if (role === 'teacher') return 'Access your teacher dashboard to track performance and development';
    return 'Sign in to your EduTracker account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">EduTracker</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getRoleTitle()}</h1>
          <p className="text-gray-600">{getRoleDescription()}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {role && (
                <Link 
                  href="/"
                  className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  data-testid="back-button"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
              )}
              Sign In to Your Account
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Success Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start" data-testid="success-message">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start" data-testid="error-message">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    {...formRegister('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                size="lg"
                disabled={isLoading}
                data-testid="login-button"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {role === 'teacher' ? (
                  <>
                    Don't have an account?{' '}
                    <span className="text-gray-500">Contact your principal to create your account</span>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <Link 
                      href="/register" 
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                      data-testid="register-link"
                    >
                      Register as Principal
                    </Link>
                  </>
                )}
              </p>
              {!role && (
                <p className="text-sm text-gray-500 mt-2">
                  Teachers: Contact your principal to create your account
                </p>
              )}
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