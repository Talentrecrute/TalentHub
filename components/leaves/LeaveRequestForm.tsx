'use client'

import { requestLeave } from "@/app/actions/leave"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useState } from 'react'
import { toast } from "sonner"

export function LeaveRequestForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            const type = formData.get('type') as any
            const start = new Date(formData.get('startDate') as string)
            const end = new Date(formData.get('endDate') as string)
            const reason = formData.get('reason') as string

            await requestLeave({
                type,
                startDate: start,
                endDate: end,
                reason
            })
            
            toast.success("Demande de congés envoyée avec succès !")
            // Reset form logic would go here, or redirect
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande.")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nouvelle Demande</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de congé</Label>
                            <Select name="type" required defaultValue="PAID_LEAVE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PAID_LEAVE">Congés Payés</SelectItem>
                                    <SelectItem value="SICK_LEAVE">Maladie</SelectItem>
                                    <SelectItem value="REMOTE_WORK">Télétravail</SelectItem>
                                    <SelectItem value="UNPAID">Sans Solde</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Début</Label>
                            <Input 
                                type="date" 
                                id="startDate" 
                                name="startDate" 
                                required 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fin</Label>
                            <Input 
                                type="date" 
                                id="endDate" 
                                name="endDate" 
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motif (Optionnel)</Label>
                        <Textarea 
                            id="reason" 
                            name="reason" 
                            placeholder="Détails supplémentaires..." 
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            "Envoyer la demande"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
