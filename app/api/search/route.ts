import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Search jobs
    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        company: {
          select: { name: true }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // Search companies
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    })

    // Format results
    const results = [
      ...jobs.map(job => ({
        id: job.id,
        title: job.title,
        subtitle: job.company?.name || job.location,
        type: 'job' as const,
        href: `/jobs/${job.id}`
      })),
      ...companies.map(company => ({
        id: company.id,
        title: company.name,
        subtitle: company.industry || company.location,
        type: 'company' as const,
        href: `/companies/${company.id}`
      }))
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [] })
  }
}
