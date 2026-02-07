'use client'
import { uploadDocument } from "@/app/actions/documents"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

export function UploadDocumentDialog({ employeeId }: { employeeId?: string }) {
  const t = useTranslations('documents')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await uploadDocument(formData)
      if (result.success) {
        toast.success(t('success'))
        setOpen(false)
        setFile(null)
      } else {
        toast.error(result.error || t('error'))
      }
    } catch (error) {
       toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadTitle')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('uploadTitle')}</DialogTitle>
          <DialogDescription>
            {t('uploadDescription')}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 py-4">
          {employeeId && <input type="hidden" name="employeeId" value={employeeId} />}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('name')}
            </Label>
            <Input id="name" name="name" required className="col-span-3" placeholder="e.g. ID Card" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t('type')}
            </Label>
            <Select name="type" required defaultValue="OTHER">
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ID">{t('types.ID')}</SelectItem>
                    <SelectItem value="CONTRACT">{t('types.CONTRACT')}</SelectItem>
                    <SelectItem value="DIPLOMA">{t('types.DIPLOMA')}</SelectItem>
                    <SelectItem value="PAYSLIP">{t('types.PAYSLIP')}</SelectItem>
                    <SelectItem value="OTHER">{t('types.OTHER')}</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              {t('file')}
            </Label>
            <Input 
                id="file" 
                name="file" 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                required 
                className="col-span-3" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('upload')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
