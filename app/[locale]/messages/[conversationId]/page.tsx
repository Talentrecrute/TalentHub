import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import MessagesClient from '../MessagesClient'

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const { conversationId } = await params
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
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
    redirect('/messages')
  }

  return <MessagesClient initialConversationId={conversationId} />
}
