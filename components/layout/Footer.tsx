import { Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
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
              <li><Link href="/jobs" className="hover:text-teal-400 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-400 transition-colors">My Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/employer/post-job" className="hover:text-teal-400 transition-colors">Post a Job</Link></li>
              <li><Link href="/employer/dashboard" className="hover:text-teal-400 transition-colors">Employer Dashboard</Link></li>
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
  )
}
