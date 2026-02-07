import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, DollarSign, FileText, User } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getEmployeeData(userId: string) {
    // In a real scenario, we find the employee record linked to this user
    const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
            department: true,
            company: true
        }
    })
    return employee
}

export default async function EmployeeDashboardPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) return redirect('/auth/signin')

    const employee = await getEmployeeData(session.user.id)

    if (!employee) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Profile Not Found</h1>
                <p className="text-slate-600 mt-2">
                    It seems your employee profile hasn't been set up yet. Please contact your HR manager.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Hello, {employee.firstName}! 👋
            </h1>
            <p className="text-slate-600 mb-8">
                Welcome to your employee portal at <span className="font-semibold text-indigo-600">{employee.company.name}</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard 
                    title="Next Payday" 
                    value="Feb 28" 
                    icon={DollarSign} 
                    color="text-emerald-600" 
                    bg="bg-emerald-50"
                />
                 <DashboardCard 
                    title="Leave Balance" 
                    value="25 Days" 
                    icon={Calendar} 
                    color="text-blue-600" 
                    bg="bg-blue-50"
                />
                 <DashboardCard 
                    title="Pending Tasks" 
                    value="0" 
                    icon={Clock} 
                    color="text-amber-600" 
                    bg="bg-amber-50"
                />
                 <DashboardCard 
                    title="Documents" 
                    value="3 New" 
                    icon={FileText} 
                    color="text-indigo-600" 
                    bg="bg-indigo-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Link href="/employee/profile" className="block group">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 group-hover:border-indigo-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                                My Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">View and update your personal information and contact details.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/employee/documents" className="block group">
                     <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 group-hover:border-indigo-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                                My Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">Access your contracts, payslips, and other HR documents.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}

function DashboardCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                     <p className="text-sm font-medium text-slate-500">{title}</p>
                     <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    )
}
