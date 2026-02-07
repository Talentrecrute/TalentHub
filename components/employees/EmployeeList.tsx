'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Department, Employee } from '@prisma/client'
import { Filter, MoreHorizontal, Search, User } from 'lucide-react'
import { useState } from 'react'
import { AddEmployeeForm } from './AddEmployeeForm'

type EmployeeWithRelations = Employee & {
    department: Department | null
    user: { email: string; image: string | null } | null
}

export function EmployeeList({ 
    employees, 
    departments 
}: { 
    employees: EmployeeWithRelations[]
    departments: Department[] 
}) {
    const [searchTerm, setSearchTerm] = useState('')
    
    // Simple filter
    const filteredEmployees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                    <p className="text-slate-500">Manage your team and HR records</p>
                </div>
                <AddEmployeeForm departments={departments} />
            </div>

            <Card>
                <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input 
                                placeholder="Search employees..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id} className="cursor-pointer hover:bg-slate-50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    {employee.user?.image ? (
                                                        <img src={employee.user.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {employee.user?.email || 'No email linked'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.jobTitle}</TableCell>
                                        <TableCell>
                                            {employee.department ? (
                                                <Badge variant="secondary" className="font-normal">
                                                    {employee.department.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={employee.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        ACTIVE: "bg-emerald-100 text-emerald-700",
        PENDING_ONBOARDING: "bg-amber-100 text-amber-700",
        TERMINATED: "bg-red-100 text-red-700",
        ON_LEAVE: "bg-blue-100 text-blue-700",
    }

    const labels: Record<string, string> = {
        ACTIVE: "Active",
        PENDING_ONBOARDING: "Pending",
        TERMINATED: "Terminated",
        ON_LEAVE: "On Leave",
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING_ONBOARDING}`}>
            {labels[status] || status}
        </span>
    )
}
