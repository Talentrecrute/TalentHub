import { getDepartments, getEmployees } from '@/app/actions/employee'
import { EmployeeList } from '@/components/employees/EmployeeList'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Employees | OceanicJob Employer',
    description: 'Manage your employees and HR records',
}

export default async function EmployeesPage() {
    const employees = await getEmployees()
    const departments = await getDepartments()

    // Cast the specific type that includes relations
    // In a real app we might want to strict type share between client/server but here we trust the layout
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmployeeList employees={employees as any} departments={departments} />
        </div>
    )
}
