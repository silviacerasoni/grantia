"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Filter, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportExpensesToAccountingFormat } from "@/lib/accounting-export";
import { getProjectExpenses } from "@/app/actions/finance";

// Type matching the server action return
type Expense = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    payment_status: "pending_payment" | "paid" | "reconciled"; // Note: DB column name uses underscore
    receipt_url?: string;
    user_name?: string;
};


export function ExpenseTable({ projectId }: { projectId?: string }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const fetchExpenses = async () => {
            // If no projectId is passed, we might want to fetch all (for global dashboard) setup later
            // For now assume projectId is required or handle gracefully
            const pid = projectId || "";
            const data = await getProjectExpenses(pid);
            setExpenses(data || []);
            setLoading(false);
        };
        fetchExpenses();
    }, [projectId]);

    const filteredExpenses = expenses.filter(expense => {
        const matchesText = (expense.description || "").toLowerCase().includes(filterText.toLowerCase());
        const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
        // Simple category filter for now
        const matchesCategory = categoryFilter === "all" || (expense.category || "").toLowerCase().includes(categoryFilter.toLowerCase());

        return matchesText && matchesStatus && matchesCategory;
    });

    const handleExport = () => {
        // Map back to format expected by export util if needed, or update util
        const exportData = filteredExpenses.map(e => ({
            ...e,
            paymentStatus: e.payment_status // Map back for compatibility if util expects camelCase
        }));

        const data = exportExpensesToAccountingFormat(exportData as any);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `expenses_export_${format(new Date(), 'yyyyMMdd')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search description..."
                        className="pl-8"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3 h-3" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category Filter - Could be dynamic based on available categories in list */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="personnel">Personnel</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={handleExport} title="Export for Accounting">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{expense.date ? format(new Date(expense.date), "MMM d, yyyy") : "-"}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{expense.category}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{expense.description}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">{expense.user_name}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={expense.status === "approved" ? "default" : expense.status === "pending" ? "secondary" : "destructive"}
                                        className={
                                            expense.status === "approved" ? "bg-green-600 hover:bg-green-600/80" :
                                                expense.status === "pending" ? "bg-amber-500 hover:bg-amber-500/80 text-white" : ""
                                        }
                                    >
                                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        expense.payment_status === "paid" ? "border-green-500 text-green-600" :
                                            expense.payment_status === "reconciled" ? "border-blue-500 text-blue-600 bg-blue-50" : "text-muted-foreground"
                                    }>
                                        {(expense.payment_status || "pending_payment").replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">€{Number(expense.amount).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No expenses recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
