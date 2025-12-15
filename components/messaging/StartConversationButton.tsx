'use client'

import { Button } from "@/components/ui/button"
import { MessageSquare } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface StartConversationButtonProps {
  receiverId: string
  applicationId?: string
  jobId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function StartConversationButton({
  receiverId,
  applicationId,
  jobId,
  variant = 'outline',
  size = 'sm',
  className = ''
}: StartConversationButtonProps) {
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const startConversation = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          applicationId,
          jobId
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        router.push(`/messages`)
        toast.success(locale === 'fr' ? 'Conversation ouverte' : 'Conversation opened')
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      toast.error(locale === 'fr' ? 'Erreur' : 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={startConversation}
      disabled={isLoading}
      className={className}
    >
      <MessageSquare className="w-4 h-4 mr-1" />
      {isLoading 
        ? (locale === 'fr' ? 'Chargement...' : 'Loading...')
        : (locale === 'fr' ? 'Contacter' : 'Contact')
      }
    </Button>
  )
}
