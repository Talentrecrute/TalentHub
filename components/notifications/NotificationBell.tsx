'use client'
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, Check } from 'lucide-react'
import { useState } from 'react'
import { Notification, useNotifications } from './NotificationProvider'

export function NotificationBell() {
    const t = useTranslations('notifications')
    const tCommon = useTranslations('common')
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border border-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">{t('title')}</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => markAllRead()} className="text-xs h-auto py-1">
                            {t('markAllRead')}
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            {t('empty')}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif: Notification) => (
                                <div 
                                    key={notif.id} 
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors relative group",
                                        !notif.read && "bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                                            notif.type === 'SUCCESS' ? "bg-green-500" :
                                            notif.type === 'WARNING' ? "bg-amber-500" :
                                            notif.type === 'ERROR' ? "bg-red-500" : "bg-blue-500"
                                        )} />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                            </p>
                                            
                                            {notif.link && (
                                                <Link 
                                                    href={notif.link} 
                                                    className="text-xs text-primary hover:underline block pt-1"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {tCommon('viewDetails')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.read && (
                                        <Button
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                markRead(notif.id)
                                            }}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
