import { authOptions } from '@/lib/auth'
import { notifyNewMessage } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ conversationId: string }>
}

// GET - Get messages for a conversation
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { conversationId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { initiatorId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        initiator: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { conversationId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { initiatorId: session.user.id },
          { receiverId: session.user.id }
        ]
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message and update conversation
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          content: content.trim(),
          senderId: session.user.id,
          conversationId
        },
        include: {
          sender: { select: { id: true, name: true, image: true } }
        }
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      })
    ])

    // Notify the recipient
    const recipientId = conversation.initiatorId === session.user.id 
      ? conversation.receiverId 
      : conversation.initiatorId
    
    await notifyNewMessage(recipientId, session.user.name || 'Quelqu\'un', conversationId)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
