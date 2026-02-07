'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface SalaryDistributionChartProps {
    data: {
        department: string
        totalAmount: number
    }[]
}

export function SalaryDistributionChart({ data }: SalaryDistributionChartProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Masse Salariale par Département</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis 
                            dataKey="department" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <Tooltip />
                        <Bar 
                            dataKey="totalAmount" 
                            fill="#0f172a" 
                            radius={[4, 4, 0, 0]} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
