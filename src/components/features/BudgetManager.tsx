"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { createBudgetCategory, deleteBudgetCategory, getProjectBudgets, BudgetCategory } from "@/app/actions/finance";
import { toast } from "sonner";

import { formatCurrency, parseCurrency } from "@/lib/utils";

export function BudgetManager({ projectId }: { projectId: string }) {
    const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newAmountDisplay, setNewAmountDisplay] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const loadBudgets = async () => {
        setLoading(true);
        const data = await getProjectBudgets(projectId);
        setBudgets(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadBudgets();
    }, [projectId]);

    const handleAmountChange = (val: string) => {
        const clean = val.replace(/[^\d,]/g, "");
        setNewAmountDisplay(clean);
        setNewAmount(parseCurrency(clean).toString());
    };

    const handleAmountBlur = () => {
        if (newAmount) {
            setNewAmountDisplay(formatCurrency(newAmount));
        }
    }

    const handleAdd = async () => {
        if (!newCategory || !newAmount) return;
        setIsAdding(true);
        const res = await createBudgetCategory(projectId, newCategory, parseFloat(newAmount));
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Budget category added");
            setNewCategory("");
            setNewAmount("");
            setNewAmountDisplay("");
            loadBudgets();
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this budget category?")) return;
        await deleteBudgetCategory(id, projectId);
        loadBudgets();
    };

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget Allocated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{formatCurrency(totalBudget)}</div>
                        <Progress value={(totalSpent / (totalBudget || 1)) * 100} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% spent (€{formatCurrency(totalSpent)})
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Add New Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <div className="grid gap-1 flex-1">
                                <Label htmlFor="cat-name" className="text-xs">Name</Label>
                                <Input
                                    id="cat-name"
                                    placeholder="e.g. Travel"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="grid gap-1 w-24">
                                <Label htmlFor="cat-amount" className="text-xs">Amount (€)</Label>
                                <Input
                                    id="cat-amount"
                                    type="text"
                                    placeholder="0,00"
                                    value={newAmountDisplay}
                                    onChange={e => handleAmountChange(e.target.value)}
                                    onBlur={handleAmountBlur}
                                    className="h-8"
                                />
                            </div>
                            <Button size="sm" onClick={handleAdd} disabled={isAdding || !newCategory}>
                                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            No budget categories defined.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map(b => {
                                const percent = Math.min(100, ((b.spent_amount || 0) / (Number(b.allocated_amount) || 1)) * 100);
                                const isOver = (b.spent_amount || 0) > Number(b.allocated_amount);

                                return (
                                    <div key={b.id} className="group">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{b.name}</span>
                                                {isOver && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded-full font-bold">OVER BUDGET</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className={isOver ? "text-red-600 font-bold" : ""}>
                                                    €{formatCurrency(b.spent_amount || 0)}
                                                </span>
                                                <span className="text-muted-foreground">/ €{formatCurrency(b.allocated_amount)}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                    onClick={() => handleDelete(b.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Progress
                                            value={percent}
                                            className={isOver ? "[&>div]:bg-red-500 bg-red-100" : ""}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
