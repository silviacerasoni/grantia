"use client";

import { ResourcePlanner } from "@/components/features/ResourcePlanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetProgressBar } from "@/components/features/BudgetProgressBar";
import { ExpenseUploader } from "@/components/features/ExpenseUploader";
import { ExpenseTable } from "@/components/features/ExpenseTable";

import { CalendarRange, Plus, Users, Settings } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProjectDashboardPage() {
    const params = useParams();
    const projectId = params.id as string; // in real app, fetch project details

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Horizon Europe Grant #88291</h1>
                    <p className="text-muted-foreground">Sustainable Urban Mobility (SUM-2026)</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Consumed</CardTitle>
                        <span className="font-bold text-muted-foreground">€</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">34%</div>
                        <p className="text-xs text-muted-foreground">€1.2M / €3.5M</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                        <CalendarRange className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">412</div>
                        <p className="text-xs text-muted-foreground">Ends Dec 2027</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Across 3 Partners</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="resources" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="resources">Resource Planning</TabsTrigger>
                    <TabsTrigger value="tasks">WBS Tasks</TabsTrigger>
                    <TabsTrigger value="finance">Financials</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Overview Content */}
                    <div className="p-4 border rounded bg-card text-muted-foreground">Overview placeholder</div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Allocation & Balancing</CardTitle>
                            <CardDescription>
                                Drag to assign resources. Red indicators highlight capacity overloads.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <ResourcePlanner />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                    {/* WBS Content */}
                    <TabsContent value="finance" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Budget Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        <BudgetProgressBar total={150000} spent={45200} />
                                        <BudgetProgressBar total={50000} spent={48000} currency="€" />
                                        <div className="text-xs text-muted-foreground">
                                            * Second bar represents "Equipment" category specific limit.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <ExpenseUploader />
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Report Log</CardTitle>
                                <CardDescription>Review and track project expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ExpenseTable />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </TabsContent>
            </Tabs>
        </div>
    );
}
