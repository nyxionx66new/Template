'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Award, 
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LandingPage() {
  const { currentUser, userData, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Redirect authenticated users to their dashboard
    if (!loading && currentUser && userData) {
      if (userData.role === 'principal') {
        router.push('/principal/dashboard');
      } else if (userData.role === 'teacher') {
        router.push('/teacher/dashboard');
      }
    }
  }, [currentUser, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <div className="spinner w-8 h-8 border-white border-t-transparent"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-scale"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-scale" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-scale" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EduTracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-indigo-900 hover:bg-gray-100 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 border border-white/20">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              Transform Education with AI-Powered Analytics
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Teacher Excellence
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your educational institution with our comprehensive teacher performance tracking, 
              professional development, and analytics platform powered by cutting-edge technology.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Feature Cards */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Smart Teacher Management",
                description: "AI-powered insights for optimal teacher allocation and development",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Advanced performance metrics with predictive analytics",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Gamified Learning",
                description: "Boost engagement with achievements and recognition systems",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level security with advanced data protection",
                color: "from-green-500 to-teal-500"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`group bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${isVisible ? 'animate-fade-in' : ''}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-2xl`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-gray-300 text-lg">Teachers Empowered</div>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-300 text-lg">Schools Transformed</div>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl font-bold text-white mb-2">98%</div>
                <div className="text-gray-300 text-lg">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Role</h2>
          <p className="text-xl text-gray-300 mb-12">Get started with the perfect dashboard for your needs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/login?role=principal">
              <Card className="group bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-lg border-white/20 hover:from-indigo-500/30 hover:to-purple-600/30 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 cursor-pointer">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-2xl">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Principal Dashboard</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Manage your school, create teacher accounts, and access comprehensive analytics
                  </p>
                  <div className="flex items-center justify-center text-indigo-300">
                    <span className="font-semibold">Access Dashboard</span>
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login?role=teacher">
              <Card className="group bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-lg border-white/20 hover:from-teal-500/30 hover:to-green-600/30 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 cursor-pointer">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-2xl">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Teacher Dashboard</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Track your performance, access training, and manage your professional development
                  </p>
                  <div className="flex items-center justify-center text-teal-300">
                    <span className="font-semibold">Access Dashboard</span>
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EduTracker</span>
          </div>
          <p className="text-gray-400 mb-4">
            Transforming education through data-driven excellence
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 EduTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}