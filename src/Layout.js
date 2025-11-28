import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, User, Building2, LogOut } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsEmployer(currentUser.role === 'admin');
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --primary: #1e3a8a;
          --primary-dark: #1e40af;
          --accent: #14b8a6;
          --text-primary: #0f172a;
          --text-secondary: #475569;
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">TalentHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to={createPageUrl('Home')} 
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Home' 
                    ? 'text-blue-900' 
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                Home
              </Link>
              <Link 
                to={createPageUrl('Jobs')} 
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Jobs' 
                    ? 'text-blue-900' 
                    : 'text-slate-600 hover:text-blue-900'
                }`}
              >
                Find Jobs
              </Link>
              
              {user ? (
                <>
                  {isEmployer ? (
                    <>
                      <Link 
                        to={createPageUrl('EmployerDashboard')} 
                        className={`text-sm font-medium transition-colors ${
                          currentPageName === 'EmployerDashboard' 
                            ? 'text-blue-900' 
                            : 'text-slate-600 hover:text-blue-900'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to={createPageUrl('PostJob')} 
                        className={`text-sm font-medium transition-colors ${
                          currentPageName === 'PostJob' 
                            ? 'text-blue-900' 
                            : 'text-slate-600 hover:text-blue-900'
                        }`}
                      >
                        Post Job
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        to={createPageUrl('Dashboard')} 
                        className={`text-sm font-medium transition-colors ${
                          currentPageName === 'Dashboard' 
                            ? 'text-blue-900' 
                            : 'text-slate-600 hover:text-blue-900'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to={createPageUrl('MyApplications')} 
                        className={`text-sm font-medium transition-colors ${
                          currentPageName === 'MyApplications' 
                            ? 'text-blue-900' 
                            : 'text-slate-600 hover:text-blue-900'
                        }`}
                      >
                        My Applications
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    to={createPageUrl('Profile')} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {isEmployer ? (
                      <Building2 className="w-4 h-4 text-slate-700" />
                    ) : (
                      <User className="w-4 h-4 text-slate-700" />
                    )}
                    <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="bg-blue-900 hover:bg-blue-800 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col gap-3">
                <Link 
                  to={createPageUrl('Home')} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to={createPageUrl('Jobs')} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Jobs
                </Link>
                
                {user ? (
                  <>
                    {isEmployer ? (
                      <>
                        <Link 
                          to={createPageUrl('EmployerDashboard')} 
                          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to={createPageUrl('PostJob')} 
                          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Post Job
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link 
                          to={createPageUrl('Dashboard')} 
                          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to={createPageUrl('MyApplications')} 
                          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Applications
                        </Link>
                      </>
                    )}
                    
                    <Link 
                      to={createPageUrl('Profile')} 
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      base44.auth.redirectToLogin(window.location.href);
                      setMobileMenuOpen(false);
                    }}
                    className="mx-4 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-600 p-2 rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">TalentHub</span>
              </div>
              <p className="text-sm text-slate-400">
                Connecting talent with opportunity. Your next career move starts here.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">For Job Seekers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('Jobs')} className="hover:text-teal-400 transition-colors">Browse Jobs</Link></li>
                <li><Link to={createPageUrl('Dashboard')} className="hover:text-teal-400 transition-colors">My Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('PostJob')} className="hover:text-teal-400 transition-colors">Post a Job</Link></li>
                <li><Link to={createPageUrl('EmployerDashboard')} className="hover:text-teal-400 transition-colors">Employer Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 TalentHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}