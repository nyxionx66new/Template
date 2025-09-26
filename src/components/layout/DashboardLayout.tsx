'use client';
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    badge?: string;
  }>;
  userRole: 'principal' | 'teacher';
}

export function DashboardLayout({ children, sidebarItems, userRole }: DashboardLayoutProps) {
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser || !userData) {
        router.push('/login');
        return;
      }

      // Check if user role matches expected role
      if (userData.role !== userRole) {
        if (userData.role === 'principal') {
          router.push('/principal/dashboard');
        } else if (userData.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }

      // Check email verification for principals
      if (userRole === 'principal' && !currentUser.emailVerified) {
        router.push('/login?message=verify-email');
        return;
      }
    }
  }, [currentUser, userData, loading, userRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="spinner w-8 h-8"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || !userData || userData.role !== userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userRole={userRole} />
      <div className="flex-1 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}