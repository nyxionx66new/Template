'use client';
import { BookOpen, Users, GraduationCap, ArrowRight, Shield, ChartBar as BarChart3, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8">
            <BookOpen className="h-10 w-10 mr-3" />
            <span className="text-3xl font-bold">EduTracker</span>
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access your personalized dashboard and continue your educational journey
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Principal Login */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-indigo-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Principal Dashboard
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Manage your school, teachers, and track institutional performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <BarChart3 className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>School Analytics & Reports</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>Teacher Management</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Shield className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>Administrative Controls</span>
                </div>
              </div>

              {/* Login Button */}
              <Link href="/login?role=principal" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 py-4 text-lg font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300"
                  size="lg"
                  data-testid="principal-login-button"
                >
                  Access Principal Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <p className="text-sm text-gray-500 text-center">
                For school administrators and principals
              </p>
            </CardContent>
          </Card>

          {/* Teacher Login */}
          <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-teal-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-600 to-emerald-600"></div>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Teacher Dashboard
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Track your performance, development, and professional growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <BarChart3 className="h-5 w-5 text-teal-600 mr-3" />
                  <span>Performance Tracking</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <BookOpen className="h-5 w-5 text-teal-600 mr-3" />
                  <span>Professional Development</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Award className="h-5 w-5 text-teal-600 mr-3" />
                  <span>Achievements & Badges</span>
                </div>
              </div>

              {/* Login Button */}
              <Link href="/login?role=teacher" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 py-4 text-lg font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300"
                  size="lg"
                  data-testid="teacher-login-button"
                >
                  Access Teacher Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <p className="text-sm text-gray-500 text-center">
                For educators and teaching staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              New to EduTracker?
            </h3>
            <p className="text-gray-600 mb-4">
              Principals can register to create their school account. Teachers receive login credentials from their principal.
            </p>
            <Link href="/register">
              <Button 
                variant="outline" 
                className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                data-testid="register-link"
              >
                Register as Principal
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 EduTracker. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}