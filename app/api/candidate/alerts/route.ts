import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// GET - List all alerts for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

// POST - Create a new alert
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, keywords, category, location, locationType } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const alert = await prisma.jobAlert.create({
      data: {
        name,
        keywords,
        category,
        location,
        locationType,
        userId: session.user.id
      }
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
