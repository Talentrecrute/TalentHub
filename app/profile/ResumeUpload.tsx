'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Eye, FileText, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface ResumeUploadProps {
  currentResume: string | null
}

export default function ResumeUpload({ currentResume }: ResumeUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume must be less than 10MB')
      return
    }

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      toast.success('Resume uploaded successfully!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentResume) return

    setUploading(true)
    try {
      const response = await fetch('/api/upload/resume', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      toast.success('Resume removed')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete resume')
    } finally {
      setUploading(false)
    }
  }

  const handleView = () => {
    if (currentResume) {
      setShowPreview(true)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {currentResume ? (
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Resume.pdf</p>
                <p className="text-sm text-slate-500">Uploaded</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog  open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={uploading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Resume Preview</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 w-full min-h-0">
                    <iframe
                      src={currentResume}
                      className="w-full h-full rounded border bg-slate-50"
                      title="Resume Preview"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDelete}
                disabled={uploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload your resume</h3>
            <p className="text-sm text-slate-600 mb-4">
              PDF only • Max 10MB
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}
