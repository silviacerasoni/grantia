"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const data = [
    { name: 'Compliant', value: 98 },
    { name: 'Remaining', value: 2 },
];
// Using CSS variables for colors if possible, or mapping them
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export function ComplianceScoreChart() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold text-foreground">98%</span>
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Score</span>
                    </div>
                </div>

                <div className="w-full mt-6 space-y-3">
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-center gap-2 text-sm text-destructive font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>CyberSec Shield: Budget Overrun Risk</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Missing Timesheets: WP2 - June</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
