import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from 'lucide-react';
import JobCard from '../Components/jobs/JobCard.js';
import JobFilters from '../Components/jobs/JobFilters.js';
import { toast } from 'sonner';

export default function Jobs() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';
  const initialCategory = urlParams.get('category') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filters, setFilters] = useState({
    location: '',
    remote: false,
    types: [],
    experienceLevels: [],
    categories: initialCategory ? [initialCategory] : [],
    salaryMin: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);

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

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', searchTerm, filters],
    queryFn: async () => {
      let allJobs = await base44.entities.Job.filter({ status: 'open' }, '-created_date', 100);
      
      // Apply filters
      return allJobs.filter(job => {
        // Search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesSearch = 
            job.title?.toLowerCase().includes(search) ||
            job.description?.toLowerCase().includes(search) ||
            job.skills?.some(s => s.toLowerCase().includes(search));
          if (!matchesSearch) return false;
        }
        
        // Location filter
        if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        // Remote filter
        if (filters.remote && !job.remote) return false;
        
        // Job type filter
        if (filters.types.length > 0 && !filters.types.includes(job.type)) return false;
        
        // Experience level filter
        if (filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.experience_level)) {
          return false;
        }
        
        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(job.category)) return false;
        
        // Salary filter
        if (filters.salaryMin > 0 && (job.salary_max || 0) < filters.salaryMin) return false;
        
        return true;
      });
    }
  });

  const { data: companies = {} } = useQuery({
    queryKey: ['companies-for-jobs', jobs],
    queryFn: async () => {
      if (!jobs.length) return {};
      const companyIds = [...new Set(jobs.map(j => j.company_id))];
      const companiesData = await Promise.all(
        companyIds.map(id => base44.entities.Company.filter({ id }))
      );
      return Object.fromEntries(
        companiesData.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: jobs.length > 0
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['saved-jobs', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SavedJob.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    const existingSave = savedJobs.find(s => s.job_id === jobId);
    
    if (existingSave) {
      await base44.entities.SavedJob.delete(existingSave.id);
      toast.success('Job removed from saved');
    } else {
      await base44.entities.SavedJob.create({ job_id: jobId, user_email: user.email });
      toast.success('Job saved successfully');
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      remote: false,
      types: [],
      experienceLevels: [],
      categories: [],
      salaryMin: 0
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Find Your Perfect Job
          </h1>
          
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 bg-slate-50 rounded-lg border border-slate-300">
              <Search className="w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by title, keyword, or company"
                className="border-0 bg-transparent focus-visible:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-slate-300"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <JobFilters 
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </aside>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <p className="text-slate-600">
                {isLoading ? 'Loading...' : `${jobs.length} jobs found`}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    company={companies[job.company_id]}
                    isSaved={savedJobs.some(s => s.job_id === job.id)}
                    onSave={() => handleSaveJob(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}