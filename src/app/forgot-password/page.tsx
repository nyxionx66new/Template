'use client';
import { useState } from 'react';
import { 
  BookOpen, 
  Mail, 
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email address.';
      } else if (err.message.includes('too-many-requests')) {
        errorMessage = 'Too many reset requests. Please try again later.';
      }
      
      setError(errorMessage);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Email Sent!</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. Please check your email and follow the instructions to reset your password.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full gradient-primary text-white" data-testid="back-to-login-button">
                  Back to Login
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setSuccess(false)}
                className="w-full"
                data-testid="resend-email-button"
              >
                Send Another Email
              </Button>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link 
                href="/login"
                className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                data-testid="back-button"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              Forgot Password
            </CardTitle>
            <CardDescription>
              We'll send you a link to reset your password
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                size="lg"
                disabled={isLoading}
                data-testid="reset-password-button"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                  data-testid="login-link"
                >
                  Back to Login
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