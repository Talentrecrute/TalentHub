'use server'

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mkdir, writeFile } from "fs/promises"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { join } from "path"
import { cwd } from "process"

export async function uploadDocument(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const file = formData.get("file") as File
  const name = formData.get("name") as string
  const type = formData.get("type") as string
  
  if (!file || !name || !type) {
    return { success: false, error: "Missing required fields" }
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return { success: false, error: "File too large (max 5MB)" }
  }

  try {
    // 1. Determine Employee/Company context
    // If uploading for self (Employee)
    let employeeId = ""
    let companyId = ""

    const userEmployeeProfile = await prisma.employee.findUnique({
        where: { userId: session.user.id }
    })

    if (userEmployeeProfile) {
        employeeId = userEmployeeProfile.id
        companyId = userEmployeeProfile.companyId
    } else {
        // Checking if Employer uploading for an Employee (via formData hidden field maybe? or context)
        // For MVP, let's assume this action is used by the Employee for themselves for now.
        // If we want Employer to upload, we'd need to pass employeeId in formData and verify ownership.
        const targetEmployeeId = formData.get("employeeId") as string
        if (targetEmployeeId) {
            // Verify if Session User is the Employer of this Employee
            const employee = await prisma.employee.findUnique({
                where: { id: targetEmployeeId },
                include: { company: true }
            })
            
            if (employee && employee.company.employerId === session.user.id) {
                employeeId = employee.id
                companyId = employee.companyId
            } else {
                 return { success: false, error: "Permission denied" }
            }
        } else {
            return { success: false, error: "Employee profile not found" }
        }
    }

    // 2. Save File
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure directory exists: public/uploads/{companyId}/{employeeId}
    const uploadDir = join(cwd(), "public", "uploads", companyId, employeeId)
    await mkdir(uploadDir, { recursive: true })

    // Unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const ext = file.name.split('.').pop()
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${uniqueSuffix}.${ext}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    // 3. Create DB Record
    // URL relative to public
    const publicUrl = `/uploads/${companyId}/${employeeId}/${filename}`

    await prisma.document.create({
        data: {
            name,
            type,
            url: publicUrl,
            employeeId,
            companyId
        }
    })

    revalidatePath('/employee/documents')
    revalidatePath(`/employer/employees/${employeeId}`)
    
    return { success: true }

  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload file" }
  }
}
