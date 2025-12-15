import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// GET - List all templates for the authenticated employer
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.jobTemplate.findMany({
      where: { employerId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST - Create a new template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      title,
      description,
      category,
      locationType,
      employmentType,
      experienceLevel,
      requirements,
      responsibilities,
      benefits,
      salaryMin,
      salaryMax,
      salaryCurrency
    } = body

    if (!name || !title || !description) {
      return NextResponse.json(
        { error: 'Name, title and description are required' },
        { status: 400 }
      )
    }

    const template = await prisma.jobTemplate.create({
      data: {
        name,
        title,
        description,
        category,
        locationType: locationType || 'onsite',
        employmentType: employmentType || 'full-time',
        experienceLevel: experienceLevel || 'mid',
        requirements,
        responsibilities,
        benefits,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'EUR',
        employerId: session.user.id
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
