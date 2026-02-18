"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const data = [
    { name: 'Jan', budget: 45000 },
    { name: 'Feb', budget: 52000 },
    { name: 'Mar', budget: 49000 },
    { name: 'Apr', budget: 63000 },
    { name: 'May', budget: 58000 },
    { name: 'Jun', budget: 81000 },
];

export function BudgetBurnRateChart() {
    return (
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle>Budget Burn Rate (Global)</CardTitle>
                    <CardDescription>Monthly expenditure tracking</CardDescription>
                </div>
                <Select defaultValue="6m">
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted-foreground)" strokeOpacity={0.2} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                tickFormatter={(value) => `€${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    color: 'var(--popover-foreground)'
                                }}
                                formatter={(value: number | string | undefined) => [`€${Number(value || 0).toLocaleString()}`, 'Budget Used']}
                            />
                            <Area type="monotone" dataKey="budget" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBudget)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
