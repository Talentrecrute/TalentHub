import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

// Check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  
  return user?.role === 'ADMIN'
}

// GET single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, image: true }
      }
    }
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ post })
}

// UPDATE blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, content, category, tags, locale, status, image } = body

    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update publishedAt if status changed to PUBLISHED
    const publishedAt = status === 'PUBLISHED' && existingPost.status === 'DRAFT'
      ? new Date()
      : existingPost.publishedAt

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        description,
        content,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        locale,
        status,
        image,
        publishedAt
      }
    })

    return NextResponse.json({ post, success: true })
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
