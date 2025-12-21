import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [totalJobs, totalUsers, totalApplications, totalBlogPosts] = await Promise.all([
      prisma.job.count(),
      prisma.user.count(),
      prisma.application.count(),
      prisma.blogPost.count()
    ])

    return NextResponse.json({
      totalJobs,
      totalUsers,
      totalApplications,
      totalBlogPosts
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
