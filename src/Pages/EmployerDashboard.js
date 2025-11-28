import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, Users, Eye, CheckCircle2, 
  Clock, Plus, Edit, XCircle
} from 'lucide-react';

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(currentUser);
        
        // Load or create company
        const companies = await base44.entities.Company.filter({ created_by: currentUser.email });
        if (companies.length > 0) {
          setCompany(companies[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const { data: jobs = [] } = useQuery({
    queryKey: ['company-jobs', company?.id],
    queryFn: async () => {
      if (!company) return [];
      return await base44.entities.Job.filter({ company_id: company.id }, '-created_date');
    },
    enabled: !!company
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['all-applications', jobs],
    queryFn: async () => {
      if (!jobs.length) return [];
      const jobIds = jobs.map(j => j.id);
      const allApps = await base44.entities.Application.list();
      return allApps.filter(app => jobIds.includes(app.job_id));
    },
    enabled: jobs.length > 0
  });

  if (!user) return null;

  const openJobs = jobs.filter(j => j.status === 'open').length;
  const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);
  const pendingApps = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Employer Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              {company ? `Managing ${company.name}` : 'Manage your job postings'}
            </p>
          </div>
          <Link to={createPageUrl('PostJob')}>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Company Setup Alert */}
        {!company && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-orange-900 mb-2">Complete Your Company Profile</h3>
              <p className="text-orange-700 mb-4">
                Set up your company profile to start posting jobs
              </p>
              <Link to={createPageUrl('Profile')}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Set Up Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-blue-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700 mb-1">Open Positions</p>
                  <p className="text-3xl font-bold text-teal-900">{openJobs}</p>
                </div>
                <div className="w-12 h-12 bg-teal-200 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-teal-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Applications</p>
                  <p className="text-3xl font-bold text-purple-900">{applications.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-orange-900">{totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications Alert */}
        {pendingApps > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {pendingApps} New Applications Pending Review
                  </h3>
                  <p className="text-sm text-blue-700">
                    Review applications to move candidates through your hiring process
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first job posting to start receiving applications
                </p>
                <Link to={createPageUrl('PostJob')}>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => {
                  const jobApplications = applications.filter(a => a.job_id === job.id);
                  const newApps = jobApplications.filter(a => a.status === 'pending').length;
                  
                  return (
                    <div 
                      key={job.id}
                      className="p-6 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                            <Badge 
                              variant="secondary"
                              className={
                                job.status === 'open' 
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : job.status === 'filled'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }
                            >
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                        </div>
                        <Link to={createPageUrl(`PostJob?id=${job.id}`)}>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500">Applications</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {jobApplications.length}
                            {newApps > 0 && (
                              <span className="ml-2 text-sm text-orange-600">+{newApps} new</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Views</p>
                          <p className="text-lg font-semibold text-slate-900">{job.views || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Type</p>
                          <p className="text-sm font-medium text-slate-700">{job.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Posted</p>
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(job.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link to={createPageUrl(`JobDetail?id=${job.id}`)} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            View Job
                          </Button>
                        </Link>
                        <Link to={createPageUrl(`Applications?job_id=${job.id}`)} className="flex-1">
                          <Button className="w-full bg-blue-900 hover:bg-blue-800" size="sm">
                            View Applications ({jobApplications.length})
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}