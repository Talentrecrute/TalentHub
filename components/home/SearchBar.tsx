'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchTerm)}`)
    } else {
      router.push('/jobs')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex gap-3 max-w-2xl mx-auto bg-white p-2 rounded-xl shadow-2xl">
      <div className="flex-1 flex items-center gap-3 px-4">
        <Search className="w-5 h-5 text-slate-400" />
        <Input 
          placeholder="Job title, keywords, or company"
          className="border-0 focus-visible:ring-0 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button 
        onClick={handleSearch}
        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-base font-semibold"
      >
        Search Jobs
      </Button>
    </div>
  )
}
