'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function createCompany(data: {
  name: string
  description?: string
  website?: string
  logo?: string
  industry?: string
  size?: string
  location?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can create companies')
  }

  // Check if employer already has a company
  const existingCompany = await prisma.company.findFirst({
    where: { employerId: session.user.id }
  })

  if (existingCompany) {
    throw new Error('You already have a company. Each employer can only have one company.')
  }

  const company = await prisma.company.create({
    data: {
      ...data,
      employerId: session.user.id
    }
  })

  revalidatePath('/employer/dashboard')
  revalidatePath('/employer/post-job')
  
  return company
}

export async function updateCompany(companyId: string, data: Partial<{
  name: string
  description: string
  website: string
  logo: string
  industry: string
  size: string
  location: string
}>) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
    throw new Error('Only employers can update companies')
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company || company.employerId !== session.user.id) {
    throw new Error('Company not found or unauthorized')
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data
  })

  revalidatePath('/employer/dashboard')
  
  return updatedCompany
}
