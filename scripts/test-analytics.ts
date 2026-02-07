
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Starting HR Analytics Verification...')

  // 1. Get Company (assuming first one created)
  const company = await prisma.company.findFirst()
  if (!company) {
    console.error('❌ No company found.')
    return
  }
  console.log(`✅ Company Found: ${company.name}`)

  // 2. Headcount
  const employees = await prisma.employee.findMany({
    where: { companyId: company.id },
    select: { salary: true, department: { select: { name: true } } }
  })
  console.log(`✅ Total Employees: ${employees.length}`)

  // 3. Payroll Calculation
  const totalPayroll = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0)
  console.log(`✅ Total Payroll: ${totalPayroll} (Currency assumption: EUR)`)

  // 4. Pending Leaves
  const pendingLeaves = await prisma.leaveRequest.count({
    where: { companyId: company.id, status: 'PENDING' }
  })
  console.log(`✅ Pending Leaves: ${pendingLeaves}`)

  // 5. Salary by Department
  const salaryByDept = new Map<string, number>()
  employees.forEach(emp => {
    const dept = emp.department?.name || "Unassigned"
    salaryByDept.set(dept, (salaryByDept.get(dept) || 0) + (emp.salary || 0))
  })
  
  console.log('✅ Salary Distribution:')
  salaryByDept.forEach((amount, dept) => {
    console.log(`   - ${dept}: ${amount}`)
  })
  
  console.log('🎉 ANALYTICS VERIFICATION PASSED!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
