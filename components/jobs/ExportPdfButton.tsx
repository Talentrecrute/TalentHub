'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

interface JobData {
  title: string
  company: string
  location: string
  locationType: string
  employmentType: string
  category: string
  experienceLevel?: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string
  description: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  createdAt: Date
}

interface ExportPdfButtonProps {
  job: JobData
}

export default function ExportPdfButton({ job }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const t = useTranslations('common')
  const locale = useLocale()

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null
    const currency = job.salaryCurrency || 'EUR'
    const formatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    })
    
    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`
    }
    if (job.salaryMin) return `${formatter.format(job.salaryMin)}+`
    return `${locale === 'fr' ? "Jusqu'à" : 'Up to'} ${formatter.format(job.salaryMax!)}`
  }

  const getExperienceLabel = () => {
    if (!job.experienceLevel) return null
    const labels: Record<string, { fr: string; en: string }> = {
      entry: { fr: 'Débutant', en: 'Entry Level' },
      mid: { fr: 'Intermédiaire', en: 'Mid-Level' },
      senior: { fr: 'Senior', en: 'Senior' },
      lead: { fr: 'Lead', en: 'Lead' },
      executive: { fr: 'Directeur', en: 'Executive' }
    }
    return labels[job.experienceLevel]?.[locale as 'fr' | 'en'] || job.experienceLevel
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const salary = formatSalary()
      const experience = getExperienceLabel()
      const postedDate = new Date(job.createdAt).toLocaleDateString(
        locale === 'fr' ? 'fr-FR' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let y = 20

      // Header background
      doc.setFillColor(13, 148, 136) // Teal color
      doc.rect(0, 0, pageWidth, 50, 'F')

      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text(job.title, margin, y + 8)

      // Company
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text(job.company, margin, y + 18)

      // Meta info
      doc.setFontSize(10)
      const locationLabel = job.locationType === 'remote' 
        ? (locale === 'fr' ? 'Télétravail' : 'Remote') 
        : job.locationType === 'hybrid' 
          ? (locale === 'fr' ? 'Hybride' : 'Hybrid')
          : (locale === 'fr' ? 'Sur site' : 'On-site')
      doc.text(`${job.location} | ${locationLabel} | ${postedDate}`, margin, y + 28)

      y = 60

      // Tags
      doc.setTextColor(71, 85, 105)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      
      let tagX = margin
      const tags = [job.category, job.employmentType.replace('-', ' ')]
      if (experience) tags.push(experience)
      if (salary) tags.push(salary)
      
      tags.forEach(tag => {
        const tagWidth = doc.getTextWidth(tag) + 8
        doc.setFillColor(241, 245, 249)
        doc.roundedRect(tagX, y - 4, tagWidth, 8, 2, 2, 'F')
        doc.text(tag, tagX + 4, y + 1)
        tagX += tagWidth + 4
      })

      y += 16

      // Info Grid
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F')
      
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'normal')
      doc.text(locale === 'fr' ? 'LIEU' : 'LOCATION', margin + 5, y + 8)
      doc.text(locale === 'fr' ? 'TYPE DE CONTRAT' : 'EMPLOYMENT TYPE', margin + contentWidth/2, y + 8)
      
      doc.setFontSize(11)
      doc.setTextColor(30, 41, 59)
      doc.setFont('helvetica', 'bold')
      doc.text(job.location, margin + 5, y + 16)
      doc.text(job.employmentType.replace('-', ' '), margin + contentWidth/2, y + 16)

      if (experience) {
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'normal')
        doc.text(locale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE', margin + 5, y + 24)
        doc.setFontSize(11)
        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.text(experience, margin + 5, y + 30 - 2)
      }

      if (salary) {
        doc.setFontSize(8)
        doc.setTextColor(100, 116, 139)
        doc.setFont('helvetica', 'normal')
        doc.text(locale === 'fr' ? 'SALAIRE' : 'SALARY', margin + contentWidth/2, y + 24)
        doc.setFontSize(11)
        doc.setTextColor(13, 148, 136)
        doc.setFont('helvetica', 'bold')
        doc.text(salary, margin + contentWidth/2, y + 30 - 2)
      }

      y += 40

      // Section helper function
      const addSection = (title: string, content: string | string[], isList = false) => {
        // Check if we need a new page
        if (y > 260) {
          doc.addPage()
          y = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(15, 23, 42)
        doc.setFont('helvetica', 'bold')
        doc.text(title, margin, y)
        
        doc.setDrawColor(226, 232, 240)
        doc.line(margin, y + 2, pageWidth - margin, y + 2)
        
        y += 10

        doc.setFontSize(10)
        doc.setTextColor(71, 85, 105)
        doc.setFont('helvetica', 'normal')

        if (isList && Array.isArray(content)) {
          content.forEach(item => {
            if (y > 275) {
              doc.addPage()
              y = 20
            }
            const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 5)
            doc.text(lines, margin + 5, y)
            y += lines.length * 5 + 2
          })
        } else {
          const text = Array.isArray(content) ? content.join('\n') : content
          const lines = doc.splitTextToSize(text, contentWidth)
          
          lines.forEach((line: string) => {
            if (y > 275) {
              doc.addPage()
              y = 20
            }
            doc.text(line, margin, y)
            y += 5
          })
        }

        y += 8
      }

      // Description
      addSection(
        locale === 'fr' ? 'Description du poste' : 'Job Description',
        job.description
      )

      // Responsibilities
      if (job.responsibilities && job.responsibilities.length > 0) {
        addSection(
          locale === 'fr' ? 'Responsabilités' : 'Responsibilities',
          job.responsibilities,
          true
        )
      }

      // Requirements
      if (job.requirements && job.requirements.length > 0) {
        addSection(
          locale === 'fr' ? 'Exigences' : 'Requirements',
          job.requirements,
          true
        )
      }

      // Benefits
      if (job.benefits && job.benefits.length > 0) {
        addSection(
          locale === 'fr' ? 'Avantages' : 'Benefits',
          job.benefits,
          true
        )
      }

      // Footer
      y = doc.internal.pageSize.getHeight() - 15
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      const footerText = `OceanicJob | ${locale === 'fr' ? 'Exporté le' : 'Exported on'} ${new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')} | www.oceanicjob.com`
      doc.text(footerText, pageWidth / 2, y, { align: 'center' })

      // Generate filename and save
      const filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_${job.company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      doc.save(filename)

      setIsExporting(false)

    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2 w-full"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {t('download')} PDF
    </Button>
  )
}
