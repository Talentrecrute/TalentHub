'use server'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  name?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: any[]
  education?: any[]
  resume?: string
  // Company fields
  companyName?: string
  companyDescription?: string
  companyWebsite?: string
  companyIndustry?: string
  companySize?: string
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in to update your profile')
  }

  const updateData: any = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.location !== undefined) updateData.location = data.location
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.resume !== undefined) updateData.resume = data.resume
  
  // Company fields
  if (data.companyName !== undefined) updateData.companyName = data.companyName
  if (data.companyDescription !== undefined) updateData.companyDescription = data.companyDescription
  if (data.companyWebsite !== undefined) updateData.companyWebsite = data.companyWebsite
  if (data.companyIndustry !== undefined) updateData.companyIndustry = data.companyIndustry
  if (data.companySize !== undefined) updateData.companySize = data.companySize
  
  if (data.skills) {
    updateData.skills = JSON.stringify(data.skills)
  }
  if (data.experience) {
    updateData.experience = JSON.stringify(data.experience)
  }
  if (data.education) {
    updateData.education = JSON.stringify(data.education)
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  })

  // Sync Company table if employer updates company fields
  const hasCompanyFieldsUpdated = data.companyName !== undefined || 
    data.companyDescription !== undefined || 
    data.companyWebsite !== undefined || 
    data.companyIndustry !== undefined || 
    data.companySize !== undefined ||
    data.location !== undefined

  if (hasCompanyFieldsUpdated) {
    // Find existing company for this employer
    const company = await prisma.company.findFirst({
      where: { employerId: session.user.id }
    })

    if (company) {
      // Build update data for Company table
      const companyUpdateData: any = {}
      if (data.companyName !== undefined) companyUpdateData.name = data.companyName
      if (data.companyDescription !== undefined) companyUpdateData.description = data.companyDescription
      if (data.companyWebsite !== undefined) companyUpdateData.website = data.companyWebsite
      if (data.companyIndustry !== undefined) companyUpdateData.industry = data.companyIndustry
      if (data.companySize !== undefined) companyUpdateData.size = data.companySize
      if (data.location !== undefined) companyUpdateData.location = data.location

      await prisma.company.update({
        where: { id: company.id },
        data: companyUpdateData
      })
    }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/jobs')
  
  return user
}

export async function uploadResume(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('You must be signed in to upload files')
  }

  // In a real app, you would upload to a storage service like S3
  // For now, we'll just return a placeholder URL
  const file = formData.get('resume') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  // TODO: Implement actual file upload logic
  const fileUrl = `/uploads/resumes/${session.user.id}-${Date.now()}-${file.name}`
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { resume: fileUrl }
  })

  revalidatePath('/profile')
  
  return { url: fileUrl }
}
