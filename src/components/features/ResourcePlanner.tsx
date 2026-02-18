"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { upsertAllocations, AllocationInput } from "@/app/actions/planning";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Save, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { startOfWeek, addWeeks, format, isSameDay, parseISO } from "date-fns";

type PlannerProps = {
    projectId: string;
    activities: any[];
    team: any[];
    allocations: any[]; // Existing allocations from DB
};

export function ResourcePlanner({ projectId, activities, team, allocations }: PlannerProps) {
    const router = useRouter();
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [localAllocations, setLocalAllocations] = useState<Record<string, number>>({});
    // Key: "userId-activityId-dateString", Value: hours

    // Separate allocations into Current Project vs Other Projects
    const { projectAllocationsMap, otherProjectLoad } = useMemo(() => {
        const currentMap: Record<string, number> = {};
        const otherLoad: Record<string, number> = {}; // Key: "userId-dateString"

        allocations.forEach(a => {
            // Guard against stale data or missing joins
            if (!a.activity_id) return;

            if (a.project_id === projectId) {
                const key = `${a.user_id}::${a.activity_id}::${a.week_start_date}`;
                currentMap[key] = Number(a.hours);
            } else {
                const dateKey = `${a.user_id}::${a.week_start_date}`; // Activity doesn't matter for total
                otherLoad[dateKey] = (otherLoad[dateKey] || 0) + Number(a.hours);
            }
        });
        return { projectAllocationsMap: currentMap, otherProjectLoad: otherLoad };
    }, [allocations, projectId]);

    // Parse existing DB allocations into local map on init
    // Only load CURRENT project allocations into the editable state
    useMemo(() => {
        setLocalAllocations(prev => ({ ...prev, ...projectAllocationsMap }));
    }, [projectAllocationsMap]);

    // View State
    const [selectedActivityId, setSelectedActivityId] = useState<string>("all");

    // Filter activities
    const visibleActivities = selectedActivityId === "all" ? activities : activities.filter(a => a.id === selectedActivityId);

    // Generate 4 weeks view
    const weeks = Array.from({ length: 4 }).map((_, i) => addWeeks(currentWeekStart, i));

    const handleValueChange = (userId: string, activityId: string, weekDate: Date, val: string) => {
        // Allow empty string to clear the value
        const hours = val === '' ? 0 : parseFloat(val);
        const dateStr = format(weekDate, 'yyyy-MM-dd');
        const key = `${userId}::${activityId}::${dateStr}`;

        // If val is '', we can set it to 0 or undefined. 
        // If we set to 0, it shows 0. If undefined/cleaned, it shows empty.
        // Let's store the number.

        setLocalAllocations(prev => ({
            ...prev,
            [key]: isNaN(hours) ? 0 : hours
        }));
    };

    const handleSave = async () => {


        // REWRITE key parsing safely
        const safeUpdates: AllocationInput[] = [];
        for (const key in localAllocations) {
            // Key format: user_id::activity_id::dateStr
            const parts = key.split('::');
            if (parts.length === 3) {
                const [uId, aId, date] = parts;

                // Strict check: if aId is "undefined" or empty, skip.
                if (aId === 'undefined' || !aId) continue;

                safeUpdates.push({
                    user_id: uId,
                    activity_id: aId,
                    week_start_date: date,
                    hours: localAllocations[key]
                });
            }
        }

        if (safeUpdates.length === 0) return;

        const result = await upsertAllocations(projectId, safeUpdates);
        if (result.error) {
            toast.error(`Failed to save plan: ${result.error}`);
        } else {
            toast.success("Resource plan saved successfully");
            router.refresh();
        }
    };

    // Helper to get value
    const getAllocatedHours = (userId: string, activityId: string, weekDate: Date) => {
        const dateStr = format(weekDate, 'yyyy-MM-dd');
        // Use "::" separator!
        const key = `${userId}::${activityId}::${dateStr}`;
        return localAllocations[key] || 0;
    };

    // Calculate Total Load per User per Week
    // Calculate Total Load per User per Week
    const getUserWeeklyStats = (userId: string, weekDate: Date) => {
        const dateStr = format(weekDate, 'yyyy-MM-dd');
        let currentProjectTotal = 0;

        // Iterate known activities to prevent summing ghost/duplicate keys
        activities.forEach(act => {
            const key = `${userId}::${act.id}::${dateStr}`;
            currentProjectTotal += (localAllocations[key] || 0);
        });

        // otherProjectLoad keys are "userId::dateStr"
        const otherLoad = otherProjectLoad[`${userId}::${dateStr}`] || 0;
        const total = currentProjectTotal + otherLoad;

        return { currentProjectTotal, otherLoad, total };
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Resource Planner</CardTitle>
                        <CardDescription>Assign weekly hours to team members</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addWeeks(d, -1))}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-32 text-center">
                            {format(currentWeekStart, "MMM d, yyyy")}
                        </span>
                        <Button variant="outline" size="icon" onClick={() => setCurrentWeekStart(d => addWeeks(d, 1))}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleSave} className="ml-4">
                            <Save className="w-4 h-4 mr-2" /> Save Plan
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filter */}
                <div className="mb-4 w-[200px]">
                    <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter Activity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            {activities.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-2 text-left w-[200px]">Resource / Activity</th>
                                {weeks.map(week => (
                                    <th key={week.toISOString()} className="p-2 text-center w-[100px] border-l">
                                        Week {format(week, 'w')}
                                        <div className="text-xs text-muted-foreground font-normal">
                                            {format(week, 'dd MMM')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(user => (
                                <>
                                    <tr key={user.id} className="bg-muted/20 border-b">
                                        <td className="p-2 font-semibold">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                                                    {user.full_name[0]}
                                                </div>
                                                <div>
                                                    <div>{user.full_name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-normal">
                                                        Capacity: {user.weekly_capacity}h
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {weeks.map(week => {
                                            const { currentProjectTotal, otherLoad, total } = getUserWeeklyStats(user.id, week);
                                            const capacity = user.weekly_capacity || 40;
                                            const remaining = capacity - total;
                                            const isOver = total > capacity;

                                            return (
                                                <td key={week.toISOString()} className={cn("p-2 text-center border-l align-top", isOver && "bg-destructive/5")}>
                                                    <div className="flex flex-col gap-1 items-center">
                                                        {/* Total Load */}
                                                        <span className={cn("text-xs font-bold", isOver ? "text-destructive" : "text-foreground")}>
                                                            {total}h Total
                                                            {isOver && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                                                        </span>

                                                        {/* Breakdown if pertinent */}
                                                        {otherLoad > 0 && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                ({otherLoad}h other)
                                                            </span>
                                                        )}

                                                        {/* Remaining */}
                                                        <span className={cn("text-[10px] font-medium border rounded px-1.5 py-0.5",
                                                            remaining < 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-background border-muted"
                                                        )}>
                                                            {remaining >= 0 ? `${remaining}h avail` : `${Math.abs(remaining)}h over`}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {visibleActivities.map(act => (
                                        <tr key={`${user.id}-${act.id}`} className="hover:bg-muted/10 border-b last:border-0">
                                            <td className="p-2 pl-8 text-muted-foreground text-xs">
                                                └ {act.name}
                                            </td>
                                            {weeks.map(week => {
                                                const dateStr = format(week, 'yyyy-MM-dd');
                                                // key MUST match the one used in handleValueChange and initial load
                                                const key = `${user.id}::${act.id}::${dateStr}`;

                                                return (
                                                    <td key={`${user.id}-${week.toISOString()}`} className="p-1 border-l text-center">
                                                        <Input
                                                            className="h-7 w-16 mx-auto text-center text-xs"
                                                            type="number"
                                                            min={0}
                                                            // If key is missing, it's undefined. || '' makes it empty.
                                                            // If it is 0, || '' makes it empty.
                                                            // Maybe user wants to see 0? 
                                                            // But usually empty is cleaner.
                                                            // Let's try explicitly handling undefined.
                                                            value={localAllocations[key] !== undefined ? localAllocations[key] : ''}
                                                            onChange={(e) => handleValueChange(user.id, act.id, week, e.target.value)}
                                                        />
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
