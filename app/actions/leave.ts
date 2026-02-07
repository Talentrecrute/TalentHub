'use server'

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LeaveStatus, LeaveType } from "@prisma/client"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

export async function requestLeave(data: {
    startDate: Date,
    endDate: Date,
    type: LeaveType,
    reason?: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id }
    })

    if (!employee) throw new Error("Employee profile not found")

    const leave = await prisma.leaveRequest.create({
        data: {
            startDate: data.startDate,
            endDate: data.endDate,
            type: data.type,
            reason: data.reason,
            status: 'PENDING',
            employeeId: employee.id,
            companyId: employee.companyId
        }
    })

    // Notify Employer
    const company = await prisma.company.findUnique({
        where: { id: employee.companyId }
    })
    
    if (company?.employerId) {
        await createNotification(
            company.employerId,
            "Nouvelle demande de congé",
            `${session.user.name} a demandé un congé du ${data.startDate.toLocaleDateString()} au ${data.endDate.toLocaleDateString()}`,
            "INFO",
            "/employer/leaves"
        )
    }

    revalidatePath('/employee/leaves')
    revalidatePath('/employer/leaves')
    
    return leave
}

export async function updateLeaveStatus(leaveId: string, status: LeaveStatus) {
    const session = await getServerSession(authOptions)
    // In a real app, verify that the user is a manager or admin of the company
    if (!session?.user?.id) throw new Error("Unauthorized")

    const leave = await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: { status, approverId: session.user.id },
        include: { employee: true }
    })
    
    // Notify Employee
    if (leave.employee?.userId) {
        const title = status === 'APPROVED' ? "Congé validé ✅" : "Congé refusé ❌"
        const message = `Votre demande de congé pour le ${leave.startDate.toLocaleDateString()} a été ${status === 'APPROVED' ? 'acceptée' : 'refusée'}.`
        
        await createNotification(
            leave.employee.userId,
            title,
            message,
            status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
            "/employee/leaves"
        )
    }

    revalidatePath('/employee/leaves')
    revalidatePath('/employer/leaves')

    return leave
}
