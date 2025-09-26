import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole: string;
}

export function Sidebar({ items, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { logout, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-700">
        <BookOpen className="h-8 w-8 text-indigo-400" />
        <span className="ml-2 text-xl font-bold">EduTracker</span>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {userData?.role === 'principal' ? (userData as any).name : (userData as any)?.personalInfo?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-400 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}