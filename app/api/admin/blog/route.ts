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

// GET all blog posts (admin only)
export async function GET(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const locale = searchParams.get('locale') || 'fr'

  const posts = await prisma.blogPost.findMany({
    where: {
      ...(status && { status: status as any }),
      locale
    },
    include: {
      author: {
        select: { name: true, image: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json({ posts })
}

// CREATE new blog post
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, content, category, tags, locale, status, image } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug

    const post = await prisma.blogPost.create({
      data: {
        slug: finalSlug,
        title,
        description,
        content,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        locale: locale || 'fr',
        status: status || 'DRAFT',
        image,
        authorId: session!.user!.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    })

    return NextResponse.json({ post, success: true })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
