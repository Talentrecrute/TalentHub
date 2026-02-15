'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContractType, EmploymentStatus } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

// --- Departments ---

export async function createDepartment(data: {
  name: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Find the employer's company
  // TODO: Update this when we have robust permission system
  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) {
    throw new Error('Company not found')
  }

  const department = await prisma.department.create({
    data: {
      name: data.name,
      companyId: company.id
    }
  })

  revalidatePath('/dashboard/employees')
  return department
}

export async function getDepartments() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) return []

  return prisma.department.findMany({
    where: { companyId: company.id },
    include: {
      _count: {
        select: { employees: true }
      }
    }
  })
}

// --- Employees ---

export type CreateEmployeeData = {
  firstName: string
  lastName: string
  email?: string
  jobTitle: string
  departmentId?: string
  startDate: Date
  contractType: ContractType
  status?: EmploymentStatus
  salary?: number
  currency?: string
  frequency?: string
}

export async function createEmployee(data: CreateEmployeeData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) {
    throw new Error('Company not found')
  }

  // Create the employee record
  const employee = await prisma.employee.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      jobTitle: data.jobTitle,
      startDate: data.startDate,
      contractType: data.contractType,
      status: data.status || 'PENDING_ONBOARDING',
      departmentId: data.departmentId || null,
      companyId: company.id,
      salary: data.salary,
      currency: data.currency,
      frequency: data.frequency,
      // If email is provided, we might want to invite them or link to existing user
      // allowing null userId for now
    }
  })

  revalidatePath('/dashboard/employees')
  return employee
}

export async function getEmployees() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const company = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (!company) return []

  return prisma.employee.findMany({
    where: { companyId: company.id },
    include: {
      department: true,
      user: {
        select: {
          email: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getEmployee(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null
  
    // Ensure the user has access to this employee (same company)
    const company = await prisma.company.findFirst({
        where: { employerId: session.user.id }
    })

    if (!company) return null

    return prisma.employee.findFirst({
        where: { 
            id,
            companyId: company.id
        },
        include: {
            department: true,
            user: true,
            documents: true
        }
    })
}

export async function updateEmployee(id: string, data: Partial<CreateEmployeeData>) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Unauthorized')

    const company = await prisma.company.findFirst({
        where: { employerId: session.user.id }
    })

    if (!company) throw new Error('Company not found')

    // Verify ownership
    const existing = await prisma.employee.findFirst({
        where: { id, companyId: company.id }
    })

    if (!existing) throw new Error('Employee not found')

    const updateData = { ...data }
    if (updateData.departmentId === '') {
        // @ts-ignore - Prisma allows null but our type might not
        updateData.departmentId = null
    }

    const employee = await prisma.employee.update({
        where: { id },
        data: updateData
    })

    revalidatePath(`/dashboard/employees/${id}`)
    revalidatePath('/dashboard/employees')
    return employee
}

export async function hireCandidate(applicationId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Unauthorized')

    const company = await prisma.company.findFirst({
        where: { employerId: session.user.id }
    })

    if (!company) throw new Error('Company not found')

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            candidate: true,
            job: true
        }
    })

    if (!application) throw new Error('Application not found')

    // Check if already hired
    const existingEmployee = await prisma.employee.findFirst({
        where: { userId: application.candidateId, companyId: company.id }
    })

    if (existingEmployee) {
        throw new Error('Candidate is already an employee')
    }

    // Create Employee Profile
    const employee = await prisma.employee.create({
        data: {
            firstName: application.candidate.name?.split(' ')[0] || 'Unknown',
            lastName: application.candidate.name?.split(' ').slice(1).join(' ') || 'Candidate',
            jobTitle: application.job.title,
            startDate: new Date(),
            contractType: 'FULL_TIME', // Default
            status: 'PENDING_ONBOARDING',
            departmentId: null, // To be assigned
            companyId: company.id,
            userId: application.candidateId,
            salary: application.job.salaryMin, // Default to min salary offer
            currency: application.job.salaryCurrency,
        }
    })

    // Update User Role to EMPLOYEE
    await prisma.user.update({
        where: { id: application.candidateId },
        data: { role: 'EMPLOYEE' }
    })

    // Update Application Status
    await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' }
    })

    // Notify the new Employee
    await createNotification(
        application.candidateId,
        "Félicitations ! Vous êtes embauché 🎉",
        `Bienvenue chez ${company.name}. Connectez-vous à votre espace employé pour compléter votre profil.`,
        "SUCCESS",
        "/employee/dashboard"
    )

    revalidatePath('/employer/employees')
    revalidatePath(`/employer/applications/${applicationId}`)
    
    return employee
}
