"use client";

import { ApprovalQueue } from "@/components/features/ApprovalQueue";

export default function ApprovalsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
                <p className="text-muted-foreground">Review pending timesheets and expense requests.</p>
            </div>

            <ApprovalQueue />
        </div>
    );
}
