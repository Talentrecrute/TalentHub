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
    // Basic counts - these should always work
    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      totalCompanies,
      totalBlogPosts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.application.count(),
      prisma.company.count(),
      prisma.blogPost.count()
    ])

    // Recent items
    const [recentUsers, recentJobs, topCompanies] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.job.findMany({
        select: { 
          id: true, 
          title: true, 
          status: true, 
          createdAt: true,
          company: { select: { name: true, logo: true } } 
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.company.findMany({
        select: { 
          id: true, 
          name: true, 
          logo: true,
          _count: { select: { jobs: true } } 
        },
        orderBy: { jobs: { _count: 'desc' } },
        take: 5
      })
    ])

    // Weekly growth calculations
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    
    const [usersThisWeek, usersLastWeek, jobsThisWeek, jobsLastWeek] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
      prisma.job.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.job.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } })
    ])

    const userGrowth = usersLastWeek > 0 ? Math.round(((usersThisWeek - usersLastWeek) / usersLastWeek) * 100) : (usersThisWeek > 0 ? 100 : 0)
    const jobGrowth = jobsLastWeek > 0 ? Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100) : (jobsThisWeek > 0 ? 100 : 0)

    return NextResponse.json({
      counts: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalJobs,
        openJobs,
        closedJobs,
        totalApplications,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        totalCompanies,
        totalBlogPosts,
        publishedBlogPosts: 0
      },
      growth: {
        usersThisWeek,
        userGrowth,
        jobsThisWeek,
        jobGrowth
      },
      recentUsers,
      recentJobs,
      recentApplications: [],
      topCompanies: topCompanies.map(c => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        jobCount: c._count.jobs
      }))
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
