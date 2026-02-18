"use client";

import { TimesheetGrid } from "@/components/features/TimesheetGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimesheetPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Timesheet</h1>
                <p className="text-muted-foreground">Log your hours for the current week.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Entry</CardTitle>
                    <CardDescription>
                        Hours are automatically saved as drafts. Click "Submit Week" when ready for approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TimesheetGrid />
                </CardContent>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4 text-sm text-blue-800 dark:text-blue-300">
                <p><strong>Tip:</strong> You can navigate weeks using the arrow keys.</p>
            </div>
        </div>
    );
}
