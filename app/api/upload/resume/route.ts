import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink, writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPE = 'application/pdf'

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
    if (file.type !== ALLOWED_TYPE) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Get current user to check for existing resume
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { resume: true }
    })

    // Delete old resume if exists
    if (user?.resume) {
      const oldPath = path.join(process.cwd(), 'public', user.resume)
      try {
        await unlink(oldPath)
      } catch (error) {
        console.log('Old file not found or already deleted')
      }
    }

    // Create unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${session.user.id}-${Date.now()}.pdf`
    const filePath = path.join(process.cwd(), 'public/uploads/resumes', fileName)
    
    // Save file
    await writeFile(filePath, buffer)
    
    const resumeUrl = `/uploads/resumes/${fileName}`

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { resume: resumeUrl }
    })

    return NextResponse.json({
      success: true,
      resumeUrl
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
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
      select: { resume: true }
    })

    if (user?.resume) {
      // Delete file
      const filePath = path.join(process.cwd(), 'public', user.resume)
      try {
        await unlink(filePath)
      } catch (error) {
        console.log('File not found or already deleted')
      }

      // Update database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { resume: null }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}
