import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink, writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Get current user to check for existing image
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    })

    // Delete old image if exists
    if (user?.image) {
      const oldPath = path.join(process.cwd(), 'public', user.image)
      try {
        await unlink(oldPath)
      } catch (error) {
        console.log('Old file not found or already deleted')
      }
    }

    // Create unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileExtension = path.extname(file.name)
    const fileName = `${session.user.id}-${Date.now()}${fileExtension}`
    const filePath = path.join(process.cwd(), 'public/uploads/profiles', fileName)
    
    // Save file
    await writeFile(filePath, buffer)
    
    const imageUrl = `/uploads/profiles/${fileName}`

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({
      success: true,
      imageUrl
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    })

    if (user?.image) {
      // Delete file
      const filePath = path.join(process.cwd(), 'public', user.image)
      try {
        await unlink(filePath)
      } catch (error) {
        console.log('File not found or already deleted')
      }

      // Update database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: null }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
