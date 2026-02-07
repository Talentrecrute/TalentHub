'use client'

import { createEmployee } from '@/app/actions/employee'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContractType, Department } from '@prisma/client'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

// Manual Select component since we might not have a Shadcn Select yet, 
// or I should check if it exists. I didn't see it in the list.
// I'll use standard select for now for simplicity or simple divs.

export function AddEmployeeForm({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      departmentId: '',
      startDate: new Date().toISOString().split('T')[0],
      contractType: 'FULL_TIME' as ContractType,
      salary: '',
      currency: 'EUR'
  })

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
          await createEmployee({
              ...formData,
              salary: formData.salary ? parseFloat(formData.salary) : undefined,
              startDate: new Date(formData.startDate)
          })
          
          toast.success('Employee added successfully')
          setOpen(false)
          router.refresh()
          setFormData({ ...formData, firstName: '', lastName: '', email: '' }) // Reset basic fields
      } catch (error) {
          console.error(error)
          toast.error('Failed to add employee')
      } finally {
          setLoading(false)
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee profile. They will receive an email to complete their onboarding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required 
                        value={formData.firstName} 
                        onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required 
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email (Pro)</Label>
                <Input id="email" type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" required 
                        value={formData.jobTitle}
                        onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select 
                        id="department" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.departmentId}
                        onChange={e => setFormData({...formData, departmentId: e.target.value})}
                    >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <select
                        id="contractType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.contractType}
                        onChange={e => setFormData({...formData, contractType: e.target.value as ContractType})}
                    >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="FREELANCE">Freelance</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" required 
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Monthly)</Label>
                    <Input id="salary" type="number" 
                        value={formData.salary}
                        onChange={e => setFormData({...formData, salary: e.target.value})}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                        id="currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.currency}
                        onChange={e => setFormData({...formData, currency: e.target.value})}
                    >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="KMF">KMF</option>
                        <option value="MGA">MGA</option>
                    </select>
                </div>
            </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
                {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
