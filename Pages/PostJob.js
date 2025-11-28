import React, { useState, useEffect } from 'react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  "Technology", "Marketing", "Sales", "Design", "Finance", 
  "Human Resources", "Operations", "Customer Support", "Engineering", 
  "Product", "Legal", "Other"
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Executive"];

export default function PostJob() {
  const urlParams = new URLSearchParams(window.location.search);
  const editJobId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [],
    responsibilities: [],
    category: '',
    type: '',
    experience_level: '',
    location: '',
    remote: false,
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    skills: [],
    status: 'open',
    application_deadline: ''
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(currentUser);
        
        const companies = await base44.entities.Company.filter({ created_by: currentUser.email });
        if (companies.length > 0) {
          setCompany(companies[0]);
        } else {
          toast.error('Please create a company profile first');
          window.location.href = createPageUrl('Profile');
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const { data: existingJob } = useQuery({
    queryKey: ['job-edit', editJobId],
    queryFn: async () => {
      const jobs = await base44.entities.Job.filter({ id: editJobId });
      if (jobs[0]) {
        setFormData(jobs[0]);
        return jobs[0];
      }
      return null;
    },
    enabled: !!editJobId && !!company
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const jobData = {
        ...data,
        company_id: company.id,
        salary_min: data.salary_min ? parseFloat(data.salary_min) : null,
        salary_max: data.salary_max ? parseFloat(data.salary_max) : null,
      };
      
      if (editJobId && existingJob) {
        return await base44.entities.Job.update(editJobId, jobData);
      } else {
        return await base44.entities.Job.create(jobData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['company-jobs']);
      toast.success(editJobId ? 'Job updated successfully' : 'Job posted successfully');
      window.location.href = createPageUrl('EmployerDashboard');
    }
  });

  const addItem = (field, value, setter) => {
    if (value.trim()) {
      setFormData({ ...formData, [field]: [...(formData[field] || []), value.trim()] });
      setter('');
    }
  };

  const removeItem = (field, index) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  if (!user || !company) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {editJobId ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p className="text-lg text-slate-600">
            Fill out the details to {editJobId ? 'update' : 'create'} your job posting
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(formData);
          }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Job Description *</Label>
                <Textarea
                  placeholder="Describe the role, company, and what makes this opportunity exciting..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Job Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Experience Level *</Label>
                  <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Location *</Label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                />
                <Label htmlFor="remote" className="cursor-pointer">
                  Remote work available
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Salary */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Range (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.salary_currency} onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Minimum Salary</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Maximum Salary</Label>
                  <Input
                    type="number"
                    placeholder="80000"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.requirements?.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="flex-1 text-sm text-slate-700">{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem('requirements', idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', newRequirement, setNewRequirement))}
                />
                <Button 
                  type="button"
                  onClick={() => addItem('requirements', newRequirement, setNewRequirement)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.responsibilities?.map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="flex-1 text-sm text-slate-700">{resp}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem('responsibilities', idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a responsibility"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibilities', newResponsibility, setNewResponsibility))}
                />
                <Button 
                  type="button"
                  onClick={() => addItem('responsibilities', newResponsibility, setNewResponsibility)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeItem('skills', idx)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', newSkill, setNewSkill))}
                />
                <Button 
                  type="button"
                  onClick={() => addItem('skills', newSkill, setNewSkill)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Application Deadline (Optional)</Label>
                <Input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                />
              </div>

              {editJobId && (
                <div>
                  <Label>Job Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filled">Filled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = createPageUrl('EmployerDashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editJobId ? 'Update Job' : 'Post Job'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}