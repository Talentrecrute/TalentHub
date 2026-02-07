import { LeaveApprovalList } from '@/components/leaves/LeaveApprovalList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getLeaveRequests(userId: string) {
    // 1. Get the company of the logged-in user (who is an employer/manager)
    // Assuming for MVP the logged in user is the "Employer" user who owns the company.
    // Ideally we should check if they are an Employee with Manager role too.
    
    const company = await prisma.company.findFirst({
        where: { employerId: userId },
        include: {
            employees: { select: { id: true } }
        }
    })

    if (!company) return { pending: [], history: [] }

    const allRequests = await prisma.leaveRequest.findMany({
        where: { companyId: company.id },
        include: {
            employee: true
        },
        orderBy: { createdAt: 'desc' }
    })

    return {
        pending: allRequests.filter(req => req.status === 'PENDING'),
        history: allRequests.filter(req => req.status !== 'PENDING')
    }
}

export default async function EmployerLeavesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return redirect('/auth/signin')

    const { pending, history } = await getLeaveRequests(session.user.id)

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Congés</h1>
                    <p className="text-slate-600 mt-1">Validez les demandes de votre équipe.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm">
                    {pending.length} demande(s) en attente
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">À valider</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6">
                    <LeaveApprovalList requests={pending} />
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                    <div className="space-y-4">
                        {history.map((req) => (
                           <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 opacity-75">
                                <div className="flex items-center gap-4">
                                     <div className="font-medium text-slate-900">
                                        {req.employee.firstName} {req.employee.lastName}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className={`text-sm font-medium px-2 py-1 rounded
                                    ${req.status === 'APPROVED' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}
                                `}>
                                    {req.status}
                                </div>
                           </div> 
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
