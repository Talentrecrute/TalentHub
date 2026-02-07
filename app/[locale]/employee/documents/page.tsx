import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Download, FileText } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

async function getEmployeeDocuments(userId: string) {
    const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
            documents: true
        }
    })
    return employee?.documents || []
}

export default async function EmployeeDocumentsPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return redirect('/auth/signin')

    const documents = await getEmployeeDocuments(session.user.id)

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
                <UploadDocumentDialog />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Files</CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                             <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                             <p>No documents found.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                             {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{doc.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{doc.type.toLowerCase()}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                             ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
