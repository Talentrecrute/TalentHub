import SearchBar from '@/components/home/SearchBar'
import JobCard from '@/components/jobs/JobCard'
import { Button } from "@/components/ui/button"
import { prisma } from '@/lib/prisma'
import { ArrowRight, Briefcase, Code, Cog, DollarSign, Headphones, Megaphone, Palette, ShoppingCart, UserCog } from 'lucide-react'
import Link from 'next/link'

const categories = [
  { name: 'Technology', icon: Code, color: 'bg-blue-100 text-blue-700' },
  { name: 'Marketing', icon: Megaphone, color: 'bg-pink-100 text-pink-700' },
  { name: 'Sales', icon: ShoppingCart, color: 'bg-green-100 text-green-700' },
  { name: 'Design', icon: Palette, color: 'bg-purple-100 text-purple-700' },
  { name: 'Finance', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Human Resources', icon: UserCog, color: 'bg-red-100 text-red-700' },
  { name: 'Operations', icon: Cog, color: 'bg-orange-100 text-orange-700' },
  { name: 'Customer Support', icon: Headphones, color: 'bg-teal-100 text-teal-700' },
]

async function getStats() {
  const [openJobs, companies, applications] = await Promise.all([
    prisma.job.count({ where: { status: 'OPEN' } }),
    prisma.company.count(),
    prisma.application.count(),
  ])
  
  return { openJobs, companies, applications }
}

async function getFeaturedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: 'OPEN' },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
    },
  })
  
  return jobs
}

export default async function Home() {
  const stats = await getStats()
  const jobs = await getFeaturedJobs()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your Dream Job
              <span className="block text-teal-400 mt-2">Start Your Journey Today</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Connect with top companies and discover opportunities that match your skills and ambitions.
            </p>
            
            {/* Search Bar */}
            <SearchBar />

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stats.openJobs}+
                </div>
                <div className="text-blue-200 text-sm">Open Positions</div>
              </div>
              <div className="text-center border-x border-blue-700">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stats.companies}+
                </div>
                <div className="text-blue-200 text-sm">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stats.applications}+
                </div>
                <div className="text-blue-200 text-sm">Applications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-slate-600">
            Explore opportunities across various industries
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                href={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-teal-300 transition-all duration-300 text-center">
                  <div className={`w-14 h-14 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Featured Jobs
              </h2>
              <p className="text-lg text-slate-600">
                Latest opportunities from top companies
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="hidden md:flex items-center gap-2 border-slate-300">
                View All Jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  company={job.company}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs available yet</h3>
              <p className="text-slate-600 mb-6">Check back soon for new opportunities!</p>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/jobs">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white w-full">
                View All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-teal-50 mb-10">
            Join thousands of professionals finding their perfect career match on TalentHub.
          </p>
          <Link href="/jobs">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-slate-50 px-8 py-6 text-lg font-semibold">
              Explore Jobs Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
