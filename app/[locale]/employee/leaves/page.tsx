import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getEmployeeLeaves(userId: string) {
    const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
            leaves: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })
    return employee?.leaves || []
}

export default async function EmployeeLeavesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return redirect('/auth/signin')

    const leaves = await getEmployeeLeaves(session.user.id)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Mes Congés</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Request Form */}
                <div className="lg:col-span-1">
                    <LeaveRequestForm />
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des demandes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {leaves.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">Aucune demande pour le moment.</p>
                            ) : (
                                <div className="space-y-4">
                                    {leaves.map((leave) => (
                                        <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-slate-100 rounded-full">
                                                    <Calendar className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {leave.type === 'PAID_LEAVE' ? 'Congés Payés' : 
                                                         leave.type === 'SICK_LEAVE' ? 'Maladie' : 
                                                         leave.type === 'REMOTE_WORK' ? 'Télétravail' : 'Autre'}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Du {new Date(leave.startDate).toLocaleDateString()} au {new Date(leave.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <Badge variant="outline" className={`
                                                ${leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                  leave.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                  'bg-amber-50 text-amber-700 border-amber-200'}
                                            `}>
                                                {leave.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {leave.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                {leave.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                {leave.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
