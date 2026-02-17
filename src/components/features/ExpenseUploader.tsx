"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

export function ExpenseUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !category || !amount) return;

        setIsUploading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("Uploading", { file, category, amount });
        // Here we would call supabase.storage.from('receipts').upload(...)

        setIsUploading(false);
        setIsSuccess(true);

        // Reset after success
        setTimeout(() => {
            setIsSuccess(false);
            setFile(null);
            setAmount("");
            setCategory("");
        }, 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Upload Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 text-green-600 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-12 h-12 mb-2" />
                        <p className="font-medium">Expense Uploaded Successfully!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="travel">Travel & Subsistence</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="personnel">Personnel Costs</SelectItem>
                                    <SelectItem value="subcontracting">Subcontracting</SelectItem>
                                    <SelectItem value="other">Other Goods & Services</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

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
                            disabled={!file || !category || !amount || isUploading}
                        >
                            {isUploading ? "Uploading..." : "Submit Expense"}
                            {!isUploading && <Upload className="ml-2 h-4 w-4" />}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
