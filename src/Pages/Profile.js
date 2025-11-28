import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, Briefcase, GraduationCap, Plus, X, Upload, 
  MapPin, Phone, Linkedin, Globe, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  "Technology", "Marketing", "Sales", "Design", "Finance", 
  "Human Resources", "Operations", "Customer Support", "Engineering", 
  "Product", "Legal", "Other"
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    location: '',
    phone: '',
    linkedin_url: '',
    portfolio_url: '',
    cv_url: '',
    skills: [],
    experience: [],
    education: [],
    preferred_categories: [],
    preferred_job_types: [],
    expected_salary_min: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '', institution: '', field: '', start_date: '', end_date: '', current: false
  });

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
      if (profiles[0]) {
        setFormData(profiles[0]);
        return profiles[0];
      }
      return null;
    },
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return await base44.entities.UserProfile.update(profile.id, data);
      } else {
        return await base44.entities.UserProfile.create({ ...data, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', user.email]);
      setEditMode(false);
      toast.success('Profile updated successfully');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cv_url: file_url });
      toast.success('CV uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({ ...formData, skills: [...(formData.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData({ 
        ...formData, 
        experience: [...(formData.experience || []), newExperience] 
      });
      setNewExperience({
        title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: ''
      });
    }
  };

  const removeExperience = (index) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData({ 
        ...formData, 
        education: [...(formData.education || []), newEducation] 
      });
      setNewEducation({
        degree: '', institution: '', field: '', start_date: '', end_date: '', current: false
      });
    }
  };

  const removeEducation = (index) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };

  const toggleCategory = (category) => {
    const current = formData.preferred_categories || [];
    if (current.includes(category)) {
      setFormData({ ...formData, preferred_categories: current.filter(c => c !== category) });
    } else {
      setFormData({ ...formData, preferred_categories: [...current, category] });
    }
  };

  const toggleJobType = (type) => {
    const current = formData.preferred_job_types || [];
    if (current.includes(type)) {
      setFormData({ ...formData, preferred_job_types: current.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, preferred_job_types: [...current, type] });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
            <p className="text-lg text-slate-600">Manage your professional information</p>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} className="bg-blue-900 hover:bg-blue-800">
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditMode(false);
                  if (profile) setFormData(profile);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => saveMutation.mutate(formData)}
                disabled={saveMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={user.full_name} disabled className="bg-slate-50" />
                <p className="text-xs text-slate-500 mt-1">Name cannot be changed</p>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-slate-50" />
              </div>

              <div>
                <Label>Professional Title</Label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editMode}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    placeholder="City, Country"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    placeholder="+1 234 567 8900"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin_url || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Portfolio URL
                  </Label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={formData.portfolio_url || ''}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resume / CV
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.cv_url ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Resume.pdf</p>
                      <p className="text-sm text-slate-500">Uploaded</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(formData.cv_url, '_blank')}
                    >
                      View
                    </Button>
                    {editMode && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, cv_url: '' })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-3">Upload your resume (PDF only)</p>
                  {editMode && (
                    <label>
                      <Button disabled={uploading} asChild>
                        <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                    {editMode && (
                      <button
                        onClick={() => removeSkill(idx)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{exp.title}</h3>
                      <p className="text-slate-600">{exp.company}</p>
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-slate-600">{exp.description}</p>
                  )}
                </div>
              ))}

              {editMode && (
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
                  <h4 className="font-medium text-slate-900">Add Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Job Title"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                    />
                    <Input
                      placeholder="Company"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    />
                    <Input
                      placeholder="Location"
                      value={newExperience.location}
                      onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    />
                    <Input
                      type="month"
                      placeholder="Start Date"
                      value={newExperience.start_date}
                      onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                    />
                    {!newExperience.current && (
                      <Input
                        type="month"
                        placeholder="End Date"
                        value={newExperience.end_date}
                        onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                      />
                    )}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newExperience.current}
                        onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                      />
                      <span className="text-sm">Currently working here</span>
                    </label>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    rows={3}
                  />
                  <Button onClick={addExperience}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.education?.map((edu, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                      <p className="text-slate-600">{edu.institution}</p>
                      {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                    </div>
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                  </p>
                </div>
              ))}

              {editMode && (
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-3">
                  <h4 className="font-medium text-slate-900">Add Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    />
                    <Input
                      placeholder="Institution"
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                    />
                    <Input
                      type="month"
                      placeholder="Start Date"
                      value={newEducation.start_date}
                      onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                    />
                    {!newEducation.current && (
                      <Input
                        type="month"
                        placeholder="End Date"
                        value={newEducation.end_date}
                        onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })}
                      />
                    )}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEducation.current}
                        onChange={(e) => setNewEducation({ ...newEducation, current: e.target.checked })}
                      />
                      <span className="text-sm">Currently studying</span>
                    </label>
                  </div>
                  <Button onClick={addEducation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Preferred Job Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={formData.preferred_categories?.includes(cat) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.preferred_categories?.includes(cat) 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-slate-100'
                      }`}
                      onClick={() => editMode && toggleCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Preferred Job Types</Label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => (
                    <Badge
                      key={type}
                      variant={formData.preferred_job_types?.includes(type) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.preferred_job_types?.includes(type) 
                          ? 'bg-teal-600 text-white' 
                          : 'hover:bg-slate-100'
                      }`}
                      onClick={() => editMode && toggleJobType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Expected Minimum Salary (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 80000"
                  value={formData.expected_salary_min || ''}
                  onChange={(e) => setFormData({ ...formData, expected_salary_min: parseFloat(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}