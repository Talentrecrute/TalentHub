import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Building2, MapPin, Calendar, Clock, 
  ArrowRight, CheckCircle2, XCircle, Eye
} from 'lucide-react';

export default function MyApplications() {
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', user?.email],
    queryFn: async () => {
      return await base44.entities.Application.filter({ applicant_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const { data: jobs = {} } = useQuery({
    queryKey: ['jobs-for-applications', applications],
    queryFn: async () => {
      if (!applications.length) return {};
      const jobIds = [...new Set(applications.map(a => a.job_id))];
      const jobsData = await Promise.all(
        jobIds.map(async (id) => {
          const jobs = await base44.entities.Job.filter({ id });
          return jobs[0];
        })
      );
      return Object.fromEntries(
        jobsData.map(job => [job?.id, job]).filter(([id]) => id)
      );
    },
    enabled: applications.length > 0
  });

  const { data: companies = {} } = useQuery({
    queryKey: ['companies-for-applications', jobs],
    queryFn: async () => {
      const jobsArray = Object.values(jobs);
      if (!jobsArray.length) return {};
      const companyIds = [...new Set(jobsArray.map(j => j.company_id))];
      const companiesData = await Promise.all(
        companyIds.map(id => base44.entities.Company.filter({ id }))
      );
      return Object.fromEntries(
        companiesData.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: Object.keys(jobs).length > 0
  });

  if (!user) return null;

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'shortlisted':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'interview':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-lg text-slate-600">Track your job applications and their status</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-blue-700 mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.all}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-purple-700 mb-1">Interview</p>
              <p className="text-2xl font-bold text-purple-900">{statusCounts.interview}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-green-700 mb-1">Accepted</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts.accepted}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-yellow-700 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing ({statusCounts.reviewing})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({statusCounts.shortlisted})</TabsTrigger>
              <TabsTrigger value="interview">Interview ({statusCounts.interview})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({statusCounts.accepted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
              </h3>
              <p className="text-slate-600 mb-6">
                {statusFilter === 'all' 
                  ? "Start applying to jobs to see them here"
                  : "Applications with this status will appear here"}
              </p>
              <Link to={createPageUrl('Jobs')}>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => {
              const job = jobs[application.job_id];
              const company = job ? companies[job.company_id] : null;
              
              if (!job) return null;

              return (
                <Card key={application.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4 flex-1">
                        {company?.logo_url && (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={createPageUrl(`JobDetail?id=${job.id}`)}
                            className="block"
                          >
                            <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-900 transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <Building2 className="w-4 h-4" />
                            <span>{company?.name || 'Company'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="secondary"
                        className={`${getStatusColor(application.status)} border flex items-center gap-1`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Applied {new Date(application.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-2">Cover Letter</p>
                        <p className="text-sm text-slate-600 line-clamp-3">{application.cover_letter}</p>
                      </div>
                    )}

                    {application.notes && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-2">Employer Notes</p>
                        <p className="text-sm text-blue-600">{application.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <Link to={createPageUrl(`JobDetail?id=${job.id}`)} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Job Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}