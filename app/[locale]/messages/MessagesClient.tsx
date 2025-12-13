'use client'

import { Button } from "@/components/ui/button"
import type { Conversation, Message, User } from '@prisma/client'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type ConversationWithDetails = Conversation & {
  initiator: Pick<User, 'id' | 'name' | 'image' | 'role'>
  receiver: Pick<User, 'id' | 'name' | 'image' | 'role'>
  messages: Message[]
  unreadCount?: number
}

type MessageWithSender = Message & {
  sender: Pick<User, 'id' | 'name' | 'image'>
}

interface MessagesClientProps {
  initialConversationId?: string
}

export default function MessagesClient({ initialConversationId }: MessagesClientProps = {}) {
  const locale = useLocale()
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [otherUser, setOtherUser] = useState<Pick<User, 'id' | 'name' | 'image' | 'role'> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
  }, [])

  // Auto-load initial conversation messages
  useEffect(() => {
    if (initialConversationId && !hasInitialized) {
      fetchMessages(initialConversationId)
      setHasInitialized(true)
    }
  }, [initialConversationId, hasInitialized])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages when in conversation
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => fetchMessages(selectedConversation), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        const conv = data.conversation
        const other = conv.initiatorId === session?.user?.id ? conv.receiver : conv.initiator
        setOtherUser(other)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const selectConversation = (id: string) => {
    setSelectedConversation(id)
    fetchMessages(id)
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, unreadCount: 0 } : c
    ))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/messages/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages(prev => [...prev, message])
        setNewMessage('')
        fetchConversations()
      } else {
        throw new Error('Failed to send')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur d\'envoi' : 'Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 top-16 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 bottom-16 lg:bottom-0 bg-slate-50 flex">
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {locale === 'fr' ? 'Retour' : 'Back'}
            </Button>
          </Link>
        </div>

        {/* Conversations List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
              <p className="text-slate-500">
                {locale === 'fr' ? 'Aucune conversation' : 'No conversations'}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {locale === 'fr' 
                  ? 'Contactez un candidat ou un employeur pour démarrer'
                  : 'Contact a candidate or employer to start'}
              </p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = conv.initiatorId === session?.user?.id ? conv.receiver : conv.initiator
              const lastMessage = conv.messages[0]

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                    selectedConversation === conv.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                      {other.image ? (
                        <img src={other.image} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        other.name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">{other.name}</p>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {lastMessage?.content || (locale === 'fr' ? 'Nouvelle conversation' : 'New conversation')}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation && otherUser ? (
          <>
            {/* Chat Header - Fixed */}
            <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {otherUser.image ? (
                  <img src={otherUser.image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  otherUser.name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{otherUser.name}</p>
                <p className="text-xs text-slate-500">
                  {otherUser.role === 'EMPLOYER' 
                    ? (locale === 'fr' ? 'Employeur' : 'Employer')
                    : (locale === 'fr' ? 'Candidat' : 'Candidate')}
                </p>
              </div>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-500">
                    {locale === 'fr' ? 'Aucun message' : 'No messages'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {locale === 'fr' ? 'Envoyez le premier message !' : 'Send the first message!'}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === session?.user?.id
                  const showDate = index === 0 || 
                    formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt)

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOwnMessage 
                            ? 'bg-teal-600 text-white rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${
                            isOwnMessage ? 'text-teal-200' : 'text-slate-400'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Fixed */}
            <div className="h-20 px-4 flex items-center gap-3 border-t border-slate-200 bg-white shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={locale === 'fr' ? 'Écrire un message...' : 'Write a message...'}
                className="flex-1 px-4 py-3 bg-slate-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isSending}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 p-0 shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                {locale === 'fr' ? 'Vos messages' : 'Your messages'}
              </h2>
              <p className="text-slate-500 max-w-xs">
                {locale === 'fr' 
                  ? 'Sélectionnez une conversation pour afficher les messages' 
                  : 'Select a conversation to view messages'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
