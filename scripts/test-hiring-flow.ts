
// Scripts/test-hiring-flow.ts
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-hiring-flow.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🧪 Starting Hiring Flow Test...")

    // 1. Setup: Create a Mock Company, Job, and Candidate
    console.log("1. Creating Mock Data...")
    
    // Create Employer
    const employer = await prisma.user.create({
        data: {
            email: `test-employer-${Date.now()}@example.com`,
            role: 'EMPLOYER',
            name: "Test Employer"
        }
    })

    // Create Company
    const company = await prisma.company.create({
        data: {
            name: "Test Corp",
            employerId: employer.id
        }
    })

    // Create Job
    const job = await prisma.job.create({
        data: {
            title: "Senior Developer",
            description: "Test Job",
            companyId: company.id,
            category: "Tech",
            location: "Remote",
            salaryMin: 50000,
            salaryCurrency: "EUR"
        }
    })

    // Create Candidate
    const candidate = await prisma.user.create({
        data: {
            email: `test-candidate-${Date.now()}@example.com`,
            role: 'CANDIDATE',
            name: "John Does"
        }
    })

    // Create Application
    const application = await prisma.application.create({
        data: {
            jobId: job.id,
            candidateId: candidate.id,
            status: 'PENDING'
        }
    })

    console.log(`   -> Mock Data Created. App ID: ${application.id}`)

    // 2. Execute Logic: Simulate "hireCandidate" logic manually (since we can't import server actions easily in this script context without Next.js environment context sometimes)
    // NOTE: Ideally we import { hireCandidate } from '@/app/actions/employee', but for this standalone script, we'll replicate the exact PRISMA logic to verify the database behavior.
    
    console.log("2. Executing Hire Logic (Simulation)...")

    // Logic from hireCandidate:
    const appToHire = await prisma.application.findUniqueOrThrow({
        where: { id: application.id },
        include: { candidate: true, job: true }
    })

    const employee = await prisma.employee.create({
        data: {
            firstName: appToHire.candidate.name?.split(' ')[0] || 'Unknown',
            lastName: appToHire.candidate.name?.split(' ').slice(1).join(' ') || 'Candidate',
            jobTitle: appToHire.job.title,
            startDate: new Date(),
            contractType: 'FULL_TIME',
            status: 'PENDING_ONBOARDING',
            departmentId: null,
            companyId: company.id,
            userId: appToHire.candidateId,
            salary: appToHire.job.salaryMin, 
            currency: appToHire.job.salaryCurrency,
        }
    })

    await prisma.user.update({
        where: { id: appToHire.candidateId },
        data: { role: 'EMPLOYEE' }
    })

    await prisma.application.update({
        where: { id: application.id },
        data: { status: 'ACCEPTED' }
    })

    console.log(`   -> Employee Created: ${employee.id}`)

    // 3. Verification
    console.log("3. Verifying Results...")

    const updatedUser = await prisma.user.findUnique({ where: { id: candidate.id } })
    const updatedApp = await prisma.application.findUnique({ where: { id: application.id } })

    let passed = true

    if (updatedUser?.role !== 'EMPLOYEE') {
        console.error("❌ FAILED: User role not updated to EMPLOYEE")
        passed = false
    } else {
        console.log("✅ User role updated")
    }

    if (updatedApp?.status !== 'ACCEPTED') {
        console.error("❌ FAILED: Application status not updated to ACCEPTED")
        passed = false
    } else {
         console.log("✅ Application status updated")
    }

    if (employee.companyId !== company.id) {
         console.error("❌ FAILED: Employee not linked to correct company")
         passed = false
    } else {
        console.log("✅ Employee linked to company")
    }

    // Cleanup
    console.log("4. Cleaning up...")
    await prisma.employee.delete({ where: { id: employee.id } })
    await prisma.application.delete({ where: { id: application.id } })
    await prisma.job.delete({ where: { id: job.id } })
    await prisma.company.delete({ where: { id: company.id } })
    await prisma.user.delete({ where: { id: employer.id } })
    await prisma.user.delete({ where: { id: candidate.id } })

    if (passed) {
        console.log("🎉 TEST PASSED Successfully!")
    } else {
        console.error("💥 TEST FAILED")
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
