'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Mail, CircleCheck as CheckCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { currentUser, userData, emailVerified, sendVerificationEmail, checkEmailVerification, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Redirect if already verified
    if (emailVerified && userData) {
      if (userData.role === 'principal') {
        router.push('/principal/dashboard');
      } else if (userData.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
      return;
    }

    // Auto-check verification status every 5 seconds
    const interval = setInterval(() => {
      checkEmailVerification();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, emailVerified, userData, router, checkEmailVerification]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage('');
    
    try {
      await checkEmailVerification();
      if (!emailVerified) {
        setMessage('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      setMessage('Error checking verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage('');
    
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setMessage('Too many requests. Please wait before requesting another email.');
      } else {
        setMessage('Failed to send verification email. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="spinner w-8 h-8"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We've sent a verification link to your email address</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We sent a verification link to <strong>{currentUser.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Message */}
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('sent') || message.includes('verified')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                {message}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What to do next:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="font-medium mr-2">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">2.</span>
                  Click the verification link in the email
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">3.</span>
                  Return to this page - we'll automatically detect verification
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full gradient-primary text-white"
                data-testid="check-verification-button"
              >
                {isChecking ? (
                  <div className="flex items-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Verification Status
                  </>
                )}
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={isSending || countdown > 0}
                variant="outline"
                className="w-full"
                data-testid="resend-email-button"
              >
                {isSending ? (
                  <div className="flex items-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Sending...
                  </div>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            {/* Auto-refresh indicator */}
            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Auto-checking every 5 seconds
              </div>
            </div>

            {/* Logout option */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                data-testid="logout-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
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