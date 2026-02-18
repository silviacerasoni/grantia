"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createActivity } from "@/app/actions/planning";
import { Plus, Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { formatCurrency, parseCurrency } from "@/lib/utils";

export function ActivityManager({ projectId, activities }: { projectId: string, activities: any[] }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);

    // Use string for budget to handle formatting
    const [newActivity, setNewActivity] = useState({ name: '', start_date: '', end_date: '', budget: '', budgetDisplay: '' });

    const handleAdd = async () => {
        if (!newActivity.name) return;

        const result = await createActivity(projectId, {
            name: newActivity.name,
            start_date: newActivity.start_date || undefined,
            end_date: newActivity.end_date || undefined,
            budget: newActivity.budget ? parseFloat(newActivity.budget) : 0
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Activity added");
            setNewActivity({ name: '', start_date: '', end_date: '', budget: '', budgetDisplay: '' });
            setIsAdding(false);
            router.refresh(); // Refresh to show new list
        }
    };

    const handleBudgetChange = (val: string) => {
        const clean = val.replace(/[^\d,]/g, "");
        const parsed = parseCurrency(clean);
        setNewActivity({
            ...newActivity,
            budgetDisplay: clean,
            budget: parsed.toString()
        });
    };

    const handleBudgetBlur = () => {
        if (newActivity.budget) {
            setNewActivity(prev => ({
                ...prev,
                budgetDisplay: formatCurrency(prev.budget)
            }));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Work Packages / Activities</CardTitle>
                    <CardDescription>Define the project tasks and timeline</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Activity</>}
                </Button>
            </CardHeader>
            <CardContent>
                {isAdding && (
                    <div className="grid gap-4 p-4 border rounded-md mb-4 bg-muted/20">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Activity Name</Label>
                                <Input
                                    placeholder="e.g. WP1 - Analysis"
                                    value={newActivity.name}
                                    onChange={e => setNewActivity({ ...newActivity, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Budget Allocated (€)</Label>
                                <Input
                                    type="text"
                                    placeholder="0,00"
                                    value={newActivity.budgetDisplay}
                                    onChange={e => handleBudgetChange(e.target.value)}
                                    onBlur={handleBudgetBlur}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={newActivity.start_date}
                                    onChange={e => setNewActivity({ ...newActivity, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={newActivity.end_date}
                                    onChange={e => setNewActivity({ ...newActivity, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button onClick={handleAdd} disabled={!newActivity.name} className="w-full">
                            <Save className="w-4 h-4 mr-2" /> Save Activity
                        </Button>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                    No activities defined yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((act) => (
                                <TableRow key={act.id}>
                                    <TableCell className="font-medium">{act.name}</TableCell>
                                    <TableCell>
                                        {act.start_date ? (
                                            <span className="text-xs flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {new Date(act.start_date).toLocaleDateString("it-IT")} - {act.end_date ? new Date(act.end_date).toLocaleDateString("it-IT") : '...'}
                                            </span>
                                        ) : <span className="text-muted-foreground text-xs">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {act.budget_allocated ? `€${formatCurrency(act.budget_allocated)}` : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
