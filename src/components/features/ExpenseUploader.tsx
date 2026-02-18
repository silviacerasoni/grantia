"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, Loader2, Info } from "lucide-react";
import { BudgetCategory, logExpense } from "@/app/actions/finance";
import { toast } from "sonner";
import { formatCurrency, parseCurrency } from "@/lib/utils";

// Accept categories as prop for better sync
export function ExpenseUploader({
    projectId,
    categories = []
}: {
    projectId: string;
    categories?: BudgetCategory[];
}) {
    const [file, setFile] = useState<File | null>(null);
    const [categoryId, setCategoryId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [vatRate, setVatRate] = useState<string>("22");
    const [description, setDescription] = useState("");

    const [netAmount, setNetAmount] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [amountDisplay, setAmountDisplay] = useState("");

    // Calculate Net whenever amount or vatRate changes
    const handleAmountChange = (val: string) => {
        // Allow digits and one comma
        const clean = val.replace(/[^\d,]/g, "");
        setAmountDisplay(clean);

        // Parse for calculation
        const parsed = parseCurrency(clean);
        setAmount(parsed.toString()); // Keep internal amount as string/number for submission check

        const rate = parseFloat(vatRate);
        if (!isNaN(parsed) && !isNaN(rate)) {
            setNetAmount(parsed / (1 + rate / 100));
        } else {
            setNetAmount(0);
        }
    };

    // Format on blur
    const handleAmountBlur = () => {
        if (amount) {
            const formatted = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(amount));
            setAmountDisplay(formatted);
        }
    }

    const handleVatChange = (val: string) => {
        setVatRate(val);
        const gross = parseFloat(amount);
        const rate = parseFloat(val);
        if (!isNaN(gross) && !isNaN(rate)) {
            setNetAmount(gross / (1 + rate / 100));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        // Validation: Check if category exists in the list (optional safety)
        if (!categoryId || !amount) {
            toast.error("Please fill in required fields");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("categoryId", categoryId);
        formData.append("amount", amount); // Sending the numeric value
        formData.append("vatRate", vatRate);
        formData.append("description", description);
        // ...

        const result = await logExpense(formData);

        if (result.error) {
            toast.error(`Error: ${result.error}`);
            setIsUploading(false);
            return;
        }

        setIsUploading(false);
        setIsSuccess(true);
        toast.success("Expense logged successfully!");

        setTimeout(() => {
            setIsSuccess(false);
            setFile(null);
            setAmount("");
            setAmountDisplay("");
            setDescription("");
            setCategoryId("");
        }, 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Upload Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isSuccess ? (
                    // ... success state ...
                    <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-12 h-12 mb-2" />
                        <p className="font-medium">Expense Logged Successfully!</p>
                        <p className="text-sm text-muted-foreground">It is now pending approval.</p>
                    </div>
                ) : (
                    <>
                        {categories.length === 0 ? (
                            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5" />
                                <div>
                                    No budget categories defined for this project yet.<br />
                                    Please ask the Project Manager to add categories first.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select budget category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name} (Budget: {formatCurrency(cat.allocated_amount)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input
                                id="desc"
                                placeholder="What was this expense for?"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Gross Amount (€)</Label>
                                <Input
                                    id="amount"
                                    type="text"
                                    placeholder="0,00"
                                    value={amountDisplay}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    onBlur={handleAmountBlur}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vat">VAT Rate (%)</Label>
                                <Select value={vatRate} onValueChange={handleVatChange}>
                                    <SelectTrigger id="vat">
                                        <SelectValue placeholder="Rate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="22">22% (Standard)</SelectItem>
                                        <SelectItem value="10">10% (Reduced)</SelectItem>
                                        <SelectItem value="4">4% (Minimum)</SelectItem>
                                        <SelectItem value="0">0% (Exempt)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {amount && (
                            <div className="text-sm text-muted-foreground flex justify-between px-1">
                                <span>Net Amount:</span>
                                <span className="font-medium">€{formatCurrency(netAmount)}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="receipt">Receipt (PDF/Image)</Label>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <div className="flex items-center gap-2">
                                    <Input id="receipt" type="file" onChange={handleFileChange} className="cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-2"
                            onClick={handleUpload}
                            disabled={!categoryId || !amount || isUploading}
                        >
                            {isUploading ? "Processing..." : "Submit Expense"}
                            {!isUploading && <Upload className="ml-2 h-4 w-4" />}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
