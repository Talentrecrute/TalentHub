import { getEmployee } from '@/app/actions/employee'
import { EmployeeProfileView } from '@/components/employees/EmployeeProfileView'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const employee = await getEmployee(id)
    if (!employee) return { title: 'Employee Not Found' }
    
    return {
        title: `${employee.firstName} ${employee.lastName} | Employee Profile`
    }
}

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const employee = await getEmployee(id)

    if (!employee) {
        notFound()
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmployeeProfileView employee={employee as any} />
        </div>
    )
}
