"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, isSameDay, isToday, isWithinInterval, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Activity = {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    budget_allocated: number;
};

export function ProjectGanttChart({ activities }: { activities: Activity[] }) {
    // 1. Determine timeline range based on activities, or default to current month +/- 1 month
    const timeline = useMemo(() => {
        if (activities.length === 0) {
            const now = new Date();
            return { start: subWeeks(now, 1), end: addWeeks(now, 4) };
        }

        const dates = activities
            .flatMap(a => [a.start_date, a.end_date])
            .filter(Boolean)
            .map(d => new Date(d!));

        if (dates.length === 0) {
            const now = new Date();
            return { start: subWeeks(now, 1), end: addWeeks(now, 4) };
        }

        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

        // Add some padding
        return {
            start: startOfWeek(subWeeks(minDate, 1)),
            end: endOfWeek(addWeeks(maxDate, 1))
        };
    }, [activities]);

    const days = eachDayOfInterval({ start: timeline.start, end: timeline.end });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Timeline (Gantt)</CardTitle>
                <CardDescription>Visual overview of activity schedules.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full border rounded-md">
                    <div className="flex flex-col min-w-max">
                        {/* Header Row: Months */}
                        <div className="flex border-b sticky top-0 bg-background z-20">
                            <div className="w-48 p-2 font-medium text-sm border-r shrink-0 sticky left-0 bg-background z-30 border-b">
                                Activity
                            </div>
                            <div className="flex">
                                {(() => {
                                    const months: { date: Date, span: number }[] = [];
                                    let currentMonth: Date | null = null;
                                    let span = 0;

                                    days.forEach(day => {
                                        if (!currentMonth || !isSameMonth(day, currentMonth)) {
                                            if (currentMonth) months.push({ date: currentMonth, span });
                                            currentMonth = day;
                                            span = 1;
                                        } else {
                                            span++;
                                        }
                                    });
                                    if (currentMonth) months.push({ date: currentMonth, span });

                                    return months.map((m, i) => (
                                        <div
                                            key={i}
                                            className="text-xs font-semibold text-center border-r bg-muted/20 py-1 sticky top-0"
                                            style={{ width: `${m.span * 40}px` }}
                                        >
                                            {format(m.date, "MMMM yyyy")}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Header Row: Days */}
                        <div className="flex border-b sticky top-[25px] bg-background z-10">
                            <div className="w-48 p-2 border-r shrink-0 sticky left-0 bg-background z-20 border-t-0">
                                {/* Spacer for Days row under Activity header */}
                            </div>
                            <div className="flex">
                                {days.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "w-10 flex-shrink-0 text-[10px] text-center p-1 border-r flex flex-col justify-center h-8",
                                            isToday(day) && "bg-blue-50 text-blue-700 font-bold"
                                        )}
                                    >
                                        <span>{format(day, "EEE")}</span>
                                        <span>{format(day, "d")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Rows */}
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex border-b group hover:bg-muted/30">
                                <div className="w-48 p-2 text-sm text-muted-foreground font-medium border-r shrink-0 sticky left-0 bg-background group-hover:bg-background z-10 truncate" title={activity.name}>
                                    {activity.name}
                                </div>
                                <div className="flex relative">
                                    {/* Grid background */}
                                    {days.map((day) => (
                                        <div
                                            key={`${activity.id}-${day.toISOString()}`}
                                            className={cn(
                                                "w-10 flex-shrink-0 border-r h-full",
                                                isToday(day) && "bg-blue-50/50"
                                            )}
                                        />
                                    ))}

                                    {/* Evaluation bar */}
                                    {activity.start_date && activity.end_date && (
                                        (() => {
                                            const start = new Date(activity.start_date);
                                            const end = new Date(activity.end_date);

                                            // Find indices to position the bar absolute
                                            const startIndex = days.findIndex(d => isSameDay(d, start));
                                            const endIndex = days.findIndex(d => isSameDay(d, end));

                                            if (startIndex === -1 && endIndex === -1) return null; // Out of view

                                            // Adjust if start/end is outside visible range
                                            const displayStart = startIndex === -1 ? 0 : startIndex;
                                            const displayEnd = endIndex === -1 ? days.length - 1 : endIndex;

                                            const width = (displayEnd - displayStart + 1) * 40; // 40px per day
                                            const left = displayStart * 40;

                                            return (
                                                <div
                                                    className="absolute top-2 h-6 bg-blue-500 rounded-full opacity-80 shadow-sm border border-blue-600"
                                                    style={{ left: `${left}px`, width: `${width}px` }}
                                                    title={`${activity.name}: ${format(start, "PP")} - ${format(end, "PP")}`}
                                                ></div>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {activities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No activities scheduled yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
