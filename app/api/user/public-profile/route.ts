import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// PUT - Toggle public profile setting
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isPublicProfile } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { isPublicProfile: Boolean(isPublicProfile) },
      select: { isPublicProfile: true }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating public profile setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

// GET - Get current public profile setting
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPublicProfile: true }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching public profile setting:', error)
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }
}
