import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, Briefcase, Clock, DollarSign, Building2, 
  Calendar, Bookmark, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import JobCard from '../Components/jobs/JobCard.js';

export default function JobDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const jobs = await base44.entities.Job.filter({ id: jobId });
      if (jobs.length > 0) {
        // Increment view count
        await base44.entities.Job.update(jobId, { views: (jobs[0].views || 0) + 1 });
        return jobs[0];
      }
      return null;
    },
    enabled: !!jobId
  });

  const { data: company } = useQuery({
    queryKey: ['company', job?.company_id],
    queryFn: async () => {
      const companies = await base44.entities.Company.filter({ id: job.company_id });
      return companies[0] || null;
    },
    enabled: !!job?.company_id
  });

  const { data: existingApplication } = useQuery({
    queryKey: ['application', jobId, user?.email],
    queryFn: async () => {
      const apps = await base44.entities.Application.filter({
        job_id: jobId,
        applicant_email: user.email
      });
      return apps[0] || null;
    },
    enabled: !!jobId && !!user
  });

  const { data: isSaved } = useQuery({
    queryKey: ['saved-job', jobId, user?.email],
    queryFn: async () => {
      const saved = await base44.entities.SavedJob.filter({
        job_id: jobId,
        user_email: user.email
      });
      return saved.length > 0;
    },
    enabled: !!jobId && !!user
  });

  const { data: similarJobs = [] } = useQuery({
    queryKey: ['similar-jobs', job?.category],
    queryFn: async () => {
      if (!job) return [];
      const jobs = await base44.entities.Job.filter({
        status: 'open',
        category: job.category
      }, '-created_date', 4);
      return jobs.filter(j => j.id !== jobId).slice(0, 3);
    },
    enabled: !!job
  });

  const { data: similarCompanies = {} } = useQuery({
    queryKey: ['similar-companies', similarJobs],
    queryFn: async () => {
      if (!similarJobs.length) return {};
      const companyIds = [...new Set(similarJobs.map(j => j.company_id))];
      const companiesData = await Promise.all(
        companyIds.map(id => base44.entities.Company.filter({ id }))
      );
      return Object.fromEntries(
        companiesData.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: similarJobs.length > 0
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Application.create({
        job_id: jobId,
        applicant_email: user.email,
        cover_letter: coverLetter,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['application', jobId, user.email]);
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      setCoverLetter('');
    }
  });

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (isSaved) {
      const saved = await base44.entities.SavedJob.filter({
        job_id: jobId,
        user_email: user.email
      });
      if (saved[0]) {
        await base44.entities.SavedJob.delete(saved[0].id);
        queryClient.invalidateQueries(['saved-job', jobId, user.email]);
        toast.success('Job removed from saved');
      }
    } else {
      await base44.entities.SavedJob.create({ job_id: jobId, user_email: user.email });
      queryClient.invalidateQueries(['saved-job', jobId, user.email]);
      toast.success('Job saved successfully');
    }
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const format = (num) => num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num;
    if (job.salary_min && job.salary_max) {
      return `${job.salary_currency} ${format(job.salary_min)} - ${format(job.salary_max)}`;
    }
    if (job.salary_min) return `From ${job.salary_currency} ${format(job.salary_min)}`;
    return `Up to ${job.salary_currency} ${format(job.salary_max)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4 flex-1">
                    {company?.logo_url && (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-5 h-5" />
                        <span className="text-lg font-medium">{company?.name || 'Company'}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveJob}
                    className={`flex-shrink-0 ${isSaved ? 'text-teal-600' : 'text-slate-400'}`}
                  >
                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span>{job.location}</span>
                    {job.remote && (
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200">Remote</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <span>{job.type}</span>
                  </div>
                  {formatSalary() && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{formatSalary()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{job.experience_level}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">{job.category}</Badge>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">{job.type}</Badge>
                  {job.application_deadline && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Apply by {new Date(job.application_deadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Role</h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>

                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Responsibilities</h3>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {company && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About {company.name}</h2>
                  <p className="text-slate-600 mb-4">{company.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {company.industry && (
                      <div>
                        <span className="text-slate-500">Industry</span>
                        <p className="font-medium text-slate-900">{company.industry}</p>
                      </div>
                    )}
                    {company.size && (
                      <div>
                        <span className="text-slate-500">Company Size</span>
                        <p className="font-medium text-slate-900">{company.size} employees</p>
                      </div>
                    )}
                    {company.location && (
                      <div>
                        <span className="text-slate-500">Location</span>
                        <p className="font-medium text-slate-900">{company.location}</p>
                      </div>
                    )}
                    {company.website && (
                      <div>
                        <span className="text-slate-500">Website</span>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-teal-600 hover:text-teal-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6">
                {existingApplication ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Application Submitted</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Status: <span className="font-medium capitalize">{existingApplication.status}</span>
                    </p>
                    <Link to={createPageUrl('MyApplications')}>
                      <Button variant="outline" className="w-full">
                        View My Applications
                      </Button>
                    </Link>
                  </div>
                ) : showApplicationForm ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900">Apply for this position</h3>
                    <Textarea
                      placeholder="Write a cover letter (optional)"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => applyMutation.mutate()}
                        disabled={applyMutation.isPending}
                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                      >
                        {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowApplicationForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user ? (
                      <Button 
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold"
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => base44.auth.redirectToLogin(window.location.href)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg font-semibold"
                      >
                        Sign In to Apply
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={handleSaveJob}
                      className="w-full"
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save Job'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-3">
                    {similarJobs.map(similarJob => (
                      <Link
                        key={similarJob.id}
                        to={createPageUrl(`JobDetail?id=${similarJob.id}`)}
                        className="block p-4 border border-slate-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                      >
                        <h4 className="font-medium text-slate-900 mb-1 line-clamp-1">
                          {similarJob.title}
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {similarCompanies[similarJob.company_id]?.name || 'Company'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{similarJob.location}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}