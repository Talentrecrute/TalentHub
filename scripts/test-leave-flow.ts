
// Scripts/test-leave-flow.ts
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-leave-flow.ts

import { LeaveStatus, LeaveType, PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🏖️ Starting Leave Management Test...")

    // 1. Setup Mock User & Employee
    console.log("1. Creating Mock Data...")
    
    // Create Employer User
    const employerUser = await prisma.user.create({
        data: {
            email: `boss-${Date.now()}@holiday.com`,
            role: UserRole.EMPLOYER,
            name: "The Boss"
        }
    })

    // Create Company
    const company = await prisma.company.create({
        data: {
            name: "Holiday Corp",
            employerId: employerUser.id
        }
    })

    // Create Employee User
    const employeeUser = await prisma.user.create({
        data: {
            email: `employee-${Date.now()}@holiday.com`,
            role: UserRole.EMPLOYEE,
            name: "Relaxed Employee"
        }
    })

    // Create Employee Profile
    const employee = await prisma.employee.create({
        data: {
            firstName: "Relaxed",
            lastName: "Employee",
            jobTitle: "Chiller",
            startDate: new Date(),
            companyId: company.id,
            userId: employeeUser.id
        }
    })

    console.log(`   -> Employee Created: ${employee.id}`)

    // 2. Simulate Request Creation
    console.log("2. Creating Leave Request...")

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 5) // 5 days off

    const leaveRequest = await prisma.leaveRequest.create({
        data: {
            startDate: startDate,
            endDate: endDate,
            type: LeaveType.PAID_LEAVE,
            reason: "Need a break",
            employeeId: employee.id,
            companyId: company.id,
            status: LeaveStatus.PENDING
        }
    })

    console.log(`   -> Request Created: ${leaveRequest.id} [PENDING]`)

    // 3. Simulate Manager Approval
    console.log("3. Simulating Manager Approval...")

    const approvedLeave = await prisma.leaveRequest.update({
        where: { id: leaveRequest.id },
        data: { status: LeaveStatus.APPROVED }
    })

    console.log(`   -> Request Status: ${approvedLeave.status}`)

    // 4. Verification
    console.log("4. Verifying Data...")

    let passed = true

    if (approvedLeave.status !== LeaveStatus.APPROVED) {
        console.error("❌ FAILED: Status is not APPROVED")
        passed = false
    } else {
        console.log("✅ Status updated correctly")
    }

    if (approvedLeave.employeeId !== employee.id) {
        console.error("❌ FAILED: Wrong employee ID")
        passed = false
    }

    // Cleanup
    console.log("5. Cleaning up...")
    await prisma.leaveRequest.deleteMany({ where: { id: leaveRequest.id } })
    await prisma.employee.delete({ where: { id: employee.id } })
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.user.deleteMany({ 
        where: { 
            email: {
                contains: '@holiday.com'
            }
        } 
    })

    if (passed) {
        console.log("🎉 LEAVE TEST PASSED!")
    } else {
        console.error("💥 LEAVE TEST FAILED")
        process.exit(1)
    }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
