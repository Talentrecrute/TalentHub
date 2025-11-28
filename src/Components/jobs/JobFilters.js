import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Mail, Phone, FileText, MessageSquare,
  Calendar, MapPin, Linkedin, Globe, Download,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function Applications() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('job_id');
  
  const [user, setUser] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const jobs = await base44.entities.Job.filter({ id: jobId });
      return jobs[0] || null;
    },
    enabled: !!jobId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-job', jobId],
    queryFn: async () => {
      return await base44.entities.Application.filter({ job_id: jobId }, '-created_date');
    },
    enabled: !!jobId
  });

  const { data: applicantProfiles = {} } = useQuery({
    queryKey: ['applicant-profiles', applications],
    queryFn: async () => {
      if (!applications.length) return {};
      const emails = [...new Set(applications.map(a => a.applicant_email))];
      const profilesData = await Promise.all(
        emails.map(async (email) => {
          const profiles = await base44.entities.UserProfile.filter({ user_email: email });
          return { email, profile: profiles[0] || null };
        })
      );
      return Object.fromEntries(profilesData.map(({ email, profile }) => [email, profile]));
    },
    enabled: applications.length > 0
  });

  const updateMutation = useMutation({
    mutationFn: async ({ appId, data }) => {
      return await base44.entities.Application.update(appId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['applications-for-job', jobId]);
      toast.success('Application updated');
    }
  });

  const handleStatusChange = (appId, newStatus) => {
    updateMutation.mutate({ appId, data: { status: newStatus } });
  };

  const handleNotesChange = (appId, notes) => {
    updateMutation.mutate({ appId, data: { notes } });
  };

  if (!user || !job) return null;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl('EmployerDashboard')}
            className="text-sm text-slate-600 hover:text-slate-900 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Applications for {job.title}
          </h1>
          <p className="text-lg text-slate-600">{applications.length} total applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-600 capitalize">{status}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600">
                Applications will appear here as candidates apply to this position
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(application => {
              const profile = applicantProfiles[application.applicant_email];
              const isExpanded = expandedApp === application.id;

              return (
                <Card key={application.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {application.applicant_email.split('@')[0]}
                          </h3>
                          {profile?.title && (
                            <p className="text-sm text-slate-600">{profile.title}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">{application.applicant_email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedApp(isExpanded ? null : application.id)}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Contact Information</h4>
                        {profile?.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile?.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        {profile?.linkedin_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <Linkedin className="w-4 h-4 text-slate-400" />
                            <a 
                              href={profile.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {profile?.portfolio_url && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <a 
                              href={profile.portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Portfolio
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Application Details</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Applied {new Date(application.created_date).toLocaleDateString()}</span>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            application.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                            application.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            application.status === 'shortlisted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Resume</h4>
                        {profile?.cv_url ? (
                          <a 
                            href={profile.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Download CV
                            </Button>
                          </a>
                        ) : (
                          <p className="text-sm text-slate-500">No CV uploaded</p>
                        )}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Cover Letter
                        </h4>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{application.cover_letter}</p>
                      </div>
                    )}

                    {isExpanded && profile && (
                      <div className="space-y-6 pt-6 border-t border-slate-200">
                        {profile.skills && profile.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.experience && profile.experience.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Experience</h4>
                            <div className="space-y-3">
                              {profile.experience.map((exp, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <h5 className="font-medium text-slate-900">{exp.title}</h5>
                                  <p className="text-sm text-slate-600">{exp.company}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.education && profile.education.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Education</h4>
                            <div className="space-y-3">
                              {profile.education.map((edu, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <h5 className="font-medium text-slate-900">{edu.degree}</h5>
                                  <p className="text-sm text-slate-600">{edu.institution}</p>
                                  {edu.field && <p className="text-xs text-slate-500">{edu.field}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Internal Notes</h4>
                      <Textarea
                        placeholder="Add notes about this candidate..."
                        value={application.notes || ''}
                        onChange={(e) => {
                          const newNotes = e.target.value;
                          const timeoutId = setTimeout(() => {
                            handleNotesChange(application.id, newNotes);
                          }, 1000);
                          return () => clearTimeout(timeoutId);
                        }}
                        rows={3}
                      />
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