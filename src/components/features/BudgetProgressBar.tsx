"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
    total: number;
    spent: number;
    currency?: string;
}

export function BudgetProgressBar({ total, spent, currency = "€" }: BudgetProgressBarProps) {
    const percentage = Math.min((spent / total) * 100, 100);
    const remaining = Math.max(total - spent, 0);

    // Determine color based on percentage
    let colorClass = "bg-green-500";
    if (percentage > 75) {
        colorClass = "bg-amber-500";
    }
    if (percentage > 90) {
        colorClass = "bg-red-500";
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">Budget Usage</span>
                <span className={cn("font-bold", percentage > 90 ? "text-red-500" : "text-foreground")}>
                    {percentage.toFixed(1)}%
                </span>
            </div>

            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500", colorClass)}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Spent: <span className="font-medium text-foreground">{currency}{spent.toLocaleString()}</span></span>
                <span>Remaining: <span className="font-medium text-foreground">{currency}{remaining.toLocaleString()}</span></span>
            </div>
        </div>
    );
}
