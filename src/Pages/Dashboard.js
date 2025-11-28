import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, BookmarkCheck, FileText, TrendingUp, 
  User, ArrowRight, Sparkles
} from 'lucide-react';
import JobCard from '../Components/jobs/JobCard.js';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: async () => {
      return await base44.entities.Application.filter({ applicant_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['saved-jobs', user?.email],
    queryFn: async () => {
      return await base44.entities.SavedJob.filter({ user_email: user.email }, '-created_date', 6);
    },
    enabled: !!user
  });

  const { data: savedJobsData = [] } = useQuery({
    queryKey: ['saved-jobs-data', savedJobs],
    queryFn: async () => {
      if (!savedJobs.length) return [];
      const jobsData = await Promise.all(
        savedJobs.map(async (saved) => {
          const jobs = await base44.entities.Job.filter({ id: saved.job_id });
          return jobs[0];
        })
      );
      return jobsData.filter(Boolean);
    },
    enabled: savedJobs.length > 0
  });

  const { data: savedCompanies = {} } = useQuery({
    queryKey: ['saved-companies', savedJobsData],
    queryFn: async () => {
      if (!savedJobsData.length) return {};
      const companyIds = [...new Set(savedJobsData.map(j => j.company_id))];
      const companiesData = await Promise.all(
        companyIds.map(id => base44.entities.Company.filter({ id }))
      );
      return Object.fromEntries(
        companiesData.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: savedJobsData.length > 0
  });

  const { data: recommendedJobs = [] } = useQuery({
    queryKey: ['recommended-jobs', profile],
    queryFn: async () => {
      if (!profile?.preferred_categories?.length && !profile?.skills?.length) {
        const jobs = await base44.entities.Job.filter({ status: 'open' }, '-created_date', 6);
        return jobs;
      }
      
      let allJobs = await base44.entities.Job.filter({ status: 'open' }, '-created_date', 50);
      
      // Score jobs based on profile match
      const scoredJobs = allJobs.map(job => {
        let score = 0;
        
        // Match preferred categories
        if (profile.preferred_categories?.includes(job.category)) score += 3;
        
        // Match skills
        if (job.skills && profile.skills) {
          const matchingSkills = job.skills.filter(s => 
            profile.skills.some(ps => ps.toLowerCase().includes(s.toLowerCase()))
          );
          score += matchingSkills.length;
        }
        
        // Match preferred job types
        if (profile.preferred_job_types?.includes(job.type)) score += 2;
        
        return { ...job, score };
      });
      
      return scoredJobs
        .filter(j => j.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    },
    enabled: !!profile
  });

  const { data: recommendedCompanies = {} } = useQuery({
    queryKey: ['recommended-companies', recommendedJobs],
    queryFn: async () => {
      if (!recommendedJobs.length) return {};
      const companyIds = [...new Set(recommendedJobs.map(j => j.company_id))];
      const companiesData = await Promise.all(
        companyIds.map(id => base44.entities.Company.filter({ id }))
      );
      return Object.fromEntries(
        companiesData.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: recommendedJobs.length > 0
  });

  const handleUnsaveJob = async (jobId) => {
    const savedJob = savedJobs.find(s => s.job_id === jobId);
    if (savedJob) {
      await base44.entities.SavedJob.delete(savedJob.id);
      toast.success('Job removed from saved');
    }
  };

  const profileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    let total = 7;
    
    if (profile.title) completed++;
    if (profile.bio) completed++;
    if (profile.location) completed++;
    if (profile.skills?.length > 0) completed++;
    if (profile.experience?.length > 0) completed++;
    if (profile.education?.length > 0) completed++;
    if (profile.cv_url) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (!user) return null;

  const completion = profileCompletion();
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-lg text-slate-600">
            Here's what's happening with your job search
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Applications</p>
                  <p className="text-3xl font-bold text-blue-900">{applications.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700 mb-1">Saved Jobs</p>
                  <p className="text-3xl font-bold text-teal-900">{savedJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-teal-200 rounded-lg flex items-center justify-center">
                  <BookmarkCheck className="w-6 h-6 text-teal-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Profile</p>
                  <p className="text-3xl font-bold text-purple-900">{completion}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Alert */}
        {completion < 80 && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-orange-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">
                    A complete profile increases your chances of getting hired. You're {completion}% done!
                  </p>
                  <Link to={createPageUrl('Profile')}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Jobs */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                </div>
                <Link to={createPageUrl('Jobs')}>
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {recommendedJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No recommendations yet
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Complete your profile to get personalized job recommendations
                    </p>
                    <Link to={createPageUrl('Profile')}>
                      <Button>Update Profile</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      company={recommendedCompanies[job.company_id]}
                      isSaved={savedJobs.some(s => s.job_id === job.id)}
                      onSave={async () => {
                        const existing = savedJobs.find(s => s.job_id === job.id);
                        if (existing) {
                          await base44.entities.SavedJob.delete(existing.id);
                          toast.success('Job removed from saved');
                        } else {
                          await base44.entities.SavedJob.create({ job_id: job.id, user_email: user.email });
                          toast.success('Job saved successfully');
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Saved Jobs */}
            {savedJobsData.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Saved Jobs</h2>
                  <Link to={createPageUrl('Jobs')}>
                    <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {savedJobsData.slice(0, 3).map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      company={savedCompanies[job.company_id]}
                      isSaved={true}
                      onSave={() => handleUnsaveJob(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">No applications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map(app => (
                      <div key={app.id} className="p-3 border border-slate-200 rounded-lg">
                        <p className="text-sm font-medium text-slate-900 mb-1">Application</p>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary"
                            className={
                              app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              app.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }
                          >
                            {app.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(app.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to={createPageUrl('MyApplications')}>
                  <Button variant="outline" className="w-full mt-4">
                    View All Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Jobs')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to={createPageUrl('Profile')}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}