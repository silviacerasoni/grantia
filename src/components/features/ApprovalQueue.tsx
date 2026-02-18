"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { approveTimesheetBatch, rejectTimesheetEntry } from "@/app/actions/timesheets";
import { toast } from "sonner";

// Mock Data for Pending Approvals
const PENDING = [
    { id: 't1', user: 'Marco Bianchi', project: 'Sustainable Urban Mobility', date: '2025-02-10', hours: 8, description: 'Research on traffic patterns' },
    { id: 't2', user: 'Marco Bianchi', project: 'Sustainable Urban Mobility', date: '2025-02-11', hours: 8, description: 'Dataset cleaning' },
    { id: 't3', user: 'Sophie Dubois', userInitial: 'SD', project: 'Sustainable Urban Mobility', date: '2025-02-12', hours: 4, description: 'Project coordination' },
];

export function ApprovalQueue() {
    const [approvals, setApprovals] = useState(PENDING);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApproveAll = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        // await approveTimesheetBatch(approvals.map(a => a.id), 'manager-id');
        toast.success("All timesheets approved successfully");
        setApprovals([]);
        setIsProcessing(false);
    };

    const handleReject = async (id: string) => {
        // Logic to open modal for rejection reason would go here
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        setIsProcessing(true);
        // await rejectTimesheetEntry(id, reason, 'manager-id');
        setApprovals(prev => prev.filter(a => a.id !== id));
        setIsProcessing(false);
    };

    const handleApproveSingle = async (id: string) => {
        setIsProcessing(true);
        toast.success("Timesheet entry approved");
        setApprovals(prev => prev.filter(a => a.id !== id));
        setIsProcessing(false);
    };

    if (approvals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Check className="h-12 w-12 mb-4 text-green-500" />
                <p className="text-lg font-medium">All caught up!</p>
                <p>No pending approvals.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">{approvals.length} Pending Requests</span>
                </div>
                <Button onClick={handleApproveAll} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Approve All"}
                </Button>
            </div>

            <div className="grid gap-4">
                {approvals.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="flex items-center p-4 gap-4">
                            <Avatar>
                                <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold truncate">{item.user}</p>
                                    <Badge variant="outline">{item.date}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{item.project}</p>
                                <p className="text-sm mt-1">{item.description} <span className="font-bold ml-2">• {item.hours}h</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleReject(item.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-600 hover:bg-green-50" onClick={() => handleApproveSingle(item.id)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
