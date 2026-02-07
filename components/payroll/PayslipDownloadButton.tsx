'use client'

import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import { Download } from "lucide-react"

interface PayslipData {
    id: string
    period: string
    paymentDate: string
    employeeName: string
    employeeRole: string
    netSalary: number
    currency: string
    companyName: string
}

export function PayslipDownloadButton({ data }: { data: PayslipData }) {
    
    const generatePDF = () => {
        const doc = new jsPDF()
        
        // Header
        doc.setFontSize(22)
        doc.text(data.companyName, 20, 20)
        
        doc.setFontSize(16)
        doc.text("Payslip", 160, 20, { align: 'right' })

        // Period Info
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Period: ${data.period}`, 160, 30, { align: 'right' })
        doc.text(`Paid On: ${data.paymentDate}`, 160, 35, { align: 'right' })

        // Horizontal Line
        doc.setDrawColor(200)
        doc.line(20, 45, 190, 45)

        // Employee Info
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text("Employee Details", 20, 55)
        
        doc.setFontSize(10)
        doc.setTextColor(50)
        doc.text(`Name: ${data.employeeName}`, 20, 65)
        doc.text(`Role: ${data.employeeRole}`, 20, 70)
        doc.text(`Reference: ${data.id.substring(0, 8).toUpperCase()}`, 20, 75) // Mock Ref

        // Salary Table Header
        doc.setFillColor(245, 247, 250)
        doc.rect(20, 90, 170, 10, 'F')
        doc.setFontSize(10)
        doc.setTextColor(0)
        doc.text("Description", 25, 96)
        doc.text("Amount", 180, 96, { align: 'right' })

        // Line Items (Mock)
        let y = 110
        const items = [
            { label: "Basic Salary", amount: data.netSalary }, // Simplified
            { label: "Bonus / Commission", amount: 0 },
            { label: "Allowances", amount: 0 },
        ]

        items.forEach(item => {
             doc.text(item.label, 25, y)
             doc.text(`${item.amount.toFixed(2)} ${data.currency}`, 180, y, { align: 'right' })
             y += 10
        })

        // Net Pay Section
        y += 10
        doc.setDrawColor(200)
        doc.line(100, y, 190, y)
        y += 10
        
        doc.setFontSize(14)
        doc.text("Net Pay", 120, y)
        doc.setFont("helvetica", "bold")
        doc.text(`${data.netSalary.toFixed(2)} ${data.currency}`, 180, y, { align: 'right' })
        
        // Footer message
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text("This is a computer-generated document. No signature is required.", 105, 280, { align: 'center' })

        // Save
        doc.save(`Payslip_${data.employeeName.replace(' ', '_')}_${data.period}.pdf`)
    }

    return (
        <Button variant="outline" size="sm" onClick={generatePDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
        </Button>
    )
}
