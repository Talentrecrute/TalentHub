'use client'

import { updateLeaveStatus } from "@/app/actions/leave"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Check, Loader2, X } from "lucide-react"
import { useState } from 'react'
import { toast } from "sonner"

interface LeaveRequest {
    id: string
    type: string
    startDate: Date
    endDate: Date
    reason?: string | null
    status: string
    employee: {
        firstName: string
        lastName: string
        jobTitle: string
    }
}

export function LeaveApprovalList({ requests }: { requests: LeaveRequest[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null)

    async function handleAction(id: string, status: 'APPROVED' | 'REJECTED') {
        setProcessingId(id)
        try {
            await updateLeaveStatus(id, status)
            toast.success(`Demande ${status === 'APPROVED' ? 'validée' : 'refusée'} !`)
        } catch (error) {
            toast.error("Erreur lors de la mise à jour.")
            console.error(error)
        } finally {
            setProcessingId(null)
        }
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <p>Aucune demande en attente.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <Card key={req.id}>
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>{req.employee.firstName[0]}{req.employee.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-slate-900">
                                    {req.employee.firstName} {req.employee.lastName}
                                </h4>
                                <p className="text-sm text-slate-500">{req.employee.jobTitle}</p>
                            </div>
                        </div>

                        <div className="flex-1 md:mx-8">
                            <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span className="font-medium">
                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600">
                                    {Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} jours
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Type: {req.type} {req.reason && `• Motif: ${req.reason}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
                                onClick={() => handleAction(req.id, 'APPROVED')}
                                disabled={!!processingId}
                            >
                                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Valider
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800"
                                onClick={() => handleAction(req.id, 'REJECTED')}
                                disabled={!!processingId}
                            >
                                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                                Refuser
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
