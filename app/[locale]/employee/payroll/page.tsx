import { PayslipDownloadButton } from '@/components/payroll/PayslipDownloadButton'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, DollarSign, FileText } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getEmployeeData(userId: string) {
    const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
            company: true,
            documents: {
                where: { type: 'PAYSLIP' },
                orderBy: { createdAt: 'desc' }
            }
        }
    })
    return employee
}

export default async function EmployeePayrollPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return redirect('/auth/signin')

    const employee = await getEmployeeData(session.user.id)

    if (!employee) return redirect('/employee/dashboard')
    
    // In a real app, we would calculate this dynamically or fetch from a Payroll record
    // Here we use the employee's base salary as a proxy for "Net Salary" for the demo
    const lastMonthSalary = employee.salary || 0 
    const lastPayDate = new Date()
    lastPayDate.setDate(28) // Mock payment on the 28th

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">My Payslips</h1>
            <p className="text-slate-600 mb-8">View and download your monthly payslips.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardContent className="p-6">
                        <p className="text-indigo-100 font-medium text-sm">Net Salary (Last Month)</p>
                        <h3 className="text-3xl font-bold mt-2">
                             {new Intl.NumberFormat('en-US', { style: 'currency', currency: employee.currency }).format(lastMonthSalary)}
                        </h3>
                        <div className="flex items-center gap-2 mt-4 text-xs text-indigo-100 bg-white/10 w-fit px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" />
                            Paid on {lastPayDate.toLocaleDateString()}
                        </div>
                    </CardContent>
                 </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {employee.documents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DollarSign className="w-6 h-6 text-slate-300" />
                             </div>
                             <p>No payslips available yet.</p>
                             <p className="text-sm mt-1">Your first payslip will appear here after the next pay cycle.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                             {employee.documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{doc.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <PayslipDownloadButton 
                                        data={{
                                            id: doc.id,
                                            period: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                            paymentDate: new Date(doc.createdAt).toLocaleDateString(),
                                            employeeName: `${employee.firstName} ${employee.lastName}`,
                                            employeeRole: employee.jobTitle,
                                            netSalary: employee.salary || 0,
                                            currency: employee.currency,
                                            companyName: employee.company.name
                                        }}
                                    />
                                </div>
                             ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
