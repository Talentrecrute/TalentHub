import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { confirmation } = body

    // Require confirmation text
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation' },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Start transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // Delete user's applications
      await tx.application.deleteMany({
        where: { candidateId: userId }
      })

      // Delete user's saved jobs
      await tx.savedJob.deleteMany({
        where: { userId: userId }
      })

      // If employer, delete their jobs and company
      if (session.user.role === 'EMPLOYER') {
        const company = await tx.company.findFirst({
          where: { employerId: userId }
        })

        if (company) {
          // Delete applications for company's jobs
          await tx.application.deleteMany({
            where: { job: { companyId: company.id } }
          })

          // Delete saved jobs for company's jobs
          await tx.savedJob.deleteMany({
            where: { job: { companyId: company.id } }
          })

          // Delete jobs
          await tx.job.deleteMany({
            where: { companyId: company.id }
          })

          // Delete company
          await tx.company.delete({
            where: { id: company.id }
          })
        }
      }

      // Delete user's accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId: userId }
      })

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
