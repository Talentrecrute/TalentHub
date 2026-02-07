'use client'
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Department, Document, Employee } from '@prisma/client'
import { Briefcase, Calendar, Download, FileText, Mail, MapPin } from 'lucide-react'
import { UploadDocumentDialog } from "../documents/UploadDocumentDialog"

type EmployeeWithRelations = Employee & {
    department: Department | null
    user: { email: string, image: string | null } | null
    documents: Document[]
}

export function EmployeeProfileView({ employee }: { employee: EmployeeWithRelations }) {
    const t = useTranslations('profile')
    const tDocs = useTranslations('documents')

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={employee.user?.image || ''} />
                    <AvatarFallback className="text-2xl">{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h1>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Briefcase className="w-4 h-4" />
                                <span>{employee.jobTitle}</span>
                                {employee.department && (
                                    <>
                                        <span>•</span>
                                        <Badge variant="outline">{employee.department.name}</Badge>
                                    </>
                                )}
                            </div>
                        </div>
                        <Button>{t('editProfile')}</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                        {employee.user?.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {employee.user.email}
                            </div>
                        )}
                        {employee.address && (
                             <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {employee.address}
                             </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(employee.startDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="contract">Contract</TabsTrigger>
                    <TabsTrigger value="documents">{tDocs('title')}</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Professional Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <span className="text-slate-500">Employee ID</span>
                                    <span className="font-mono">{employee.id.slice(0, 8)}...</span>
                                    
                                    <span className="text-slate-500">Department</span>
                                    <span>{employee.department?.name || '-'}</span>
                                    
                                    <span className="text-slate-500">Reports To</span>
                                    <span>{employee.managerId ? 'Manager' : '-'}</span>

                                    <span className="text-slate-500">Status</span>
                                    <StatusBadge status={employee.status} />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {employee.emergencyContact ? (
                                    <p className="text-sm">{employee.emergencyContact}</p>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No emergency contact info provided.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Contract Tab */}
                <TabsContent value="contract" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-2">Terms</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Type</span>
                                            <span className="font-medium">{employee.contractType.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Start Date</span>
                                            <span className="font-medium">{new Date(employee.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>End Date</span>
                                            <span className="font-medium">{employee.endDate ? new Date(employee.endDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 mb-2">Compensation</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Base Salary</span>
                                            <span className="font-medium">
                                                {employee.salary 
                                                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: employee.currency }).format(employee.salary) 
                                                    : 'Not set'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span>Frequency</span>
                                            <span className="font-medium">{employee.frequency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{tDocs('title')}</CardTitle>
                            <UploadDocumentDialog employeeId={employee.id} />
                        </CardHeader>
                        <CardContent>
                            {employee.documents.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    {tDocs('noDocuments')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {employee.documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{doc.name}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{doc.type}{/* TODO: translate type */}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* Payroll Tab - Placeholder for now */}
                 <TabsContent value="payroll" className="mt-4">
                     <Card>
                         <CardContent className="py-8 text-center text-slate-500">
                             Payroll history coming soon in Phase 3.
                         </CardContent>
                     </Card>
                 </TabsContent>
            </Tabs>
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
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {status.replace('_', ' ')}
        </span>
    )
}
