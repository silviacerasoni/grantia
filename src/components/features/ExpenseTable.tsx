"use client";

import { useState } from "react";
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
import { Search, Filter } from "lucide-react";

type Expense = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    receiptUrl?: string;
};

// Mock Data
const EXPENSES: Expense[] = [
    { id: "1", date: "2024-02-10", category: "Travel", description: "Flight to Brussels", amount: 245.50, status: "approved" },
    { id: "2", date: "2024-02-12", category: "Equipment", description: "Server Hardware", amount: 1200.00, status: "pending" },
    { id: "3", date: "2024-02-15", category: "Other", description: "Project Workshop Catering", amount: 350.00, status: "approved" },
    { id: "4", date: "2024-02-18", category: "Travel", description: "Train to Rome", amount: 89.00, status: "rejected" },
    { id: "5", date: "2024-02-20", category: "Personnel", description: "External Consultant", amount: 5000.00, status: "pending" },
];

export function ExpenseTable() {
    const [filterText, setFilterText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredExpenses = EXPENSES.filter(expense => {
        const matchesText = expense.description.toLowerCase().includes(filterText.toLowerCase());
        const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || expense.category.toLowerCase() === categoryFilter.toLowerCase();

        return matchesText && matchesStatus && matchesCategory;
    });

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

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="personnel">Personnel</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{expense.category}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{expense.description}</TableCell>
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
                                <TableCell className="text-right">€{expense.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No expenses found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
