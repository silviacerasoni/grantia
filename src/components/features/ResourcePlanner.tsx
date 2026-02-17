"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns'; // Using standard imports
import { ChevronLeft, ChevronRight, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data Types
type Resource = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    weeklyCapacity: number; // e.g., 40 hours
};

type Allocation = {
    id: string;
    resourceId: string;
    projectId: string;
    date: Date;
    hours: number;
};

// Mock Data
const RESOURCES: Resource[] = [
    { id: '1', name: 'Dr. Elena Rossi', role: 'Senior Researcher', weeklyCapacity: 40, avatar: '' },
    { id: '2', name: 'Marco Bianchi', role: 'Junior Analyst', weeklyCapacity: 40, avatar: '' },
    { id: '3', name: 'Sophie Dubois', role: 'Project Manager', weeklyCapacity: 35, avatar: '' },
];

const ALLOCATIONS: Allocation[] = [
    { id: 'a1', resourceId: '1', projectId: 'p1', date: new Date(), hours: 8 },
    { id: 'a2', resourceId: '1', projectId: 'p1', date: addDays(new Date(), 1), hours: 8 },
    { id: 'a3', resourceId: '2', projectId: 'p1', date: new Date(), hours: 4 },
];

export function ResourcePlanner() {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [allocations, setAllocations] = useState<Allocation[]>(ALLOCATIONS);

    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));

    const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

    const getAllocation = (resourceId: string, date: Date) => {
        return allocations.find(a =>
            a.resourceId === resourceId && isSameDay(new Date(a.date), date)
        );
    };

    const calculateTotalWeeklyHours = (resourceId: string) => {
        return allocations
            .filter(a => a.resourceId === resourceId && a.date >= currentWeekStart && a.date <= addDays(currentWeekStart, 6))
            .reduce((sum, a) => sum + a.hours, 0);
    };

    const handleAddAllocation = (resourceId: string, date: Date) => {
        // Simple toggle logic for demo: Add 4 hours or remove
        const existing = getAllocation(resourceId, date);
        if (existing) {
            setAllocations(prev => prev.filter(a => a.id !== existing.id));
        } else {
            const newAllocation: Allocation = {
                id: Math.random().toString(36).substr(2, 9),
                resourceId,
                projectId: 'p1',
                date,
                hours: 4
            };
            setAllocations(prev => [...prev, newAllocation]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="font-medium text-sm w-32 text-center">
                        Week of {format(currentWeekStart, 'MMM d')}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 block"></span> Normal
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-200 block"></span> Overload
                    </div>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card">
                {/* Header Row */}
                <div className="grid grid-cols-[250px_1fr] divide-x border-b">
                    <div className="p-4 font-semibold text-sm bg-muted/50">Resource</div>
                    <div className="grid grid-cols-5 divide-x">
                        {weekDays.map(day => (
                            <div key={day.toString()} className="p-4 text-center text-sm font-medium bg-muted/50">
                                {format(day, 'EEE d')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Rows */}
                <div className="divide-y relative">
                    {RESOURCES.map(resource => {
                        const totalHours = calculateTotalWeeklyHours(resource.id);
                        const isOverloaded = totalHours > resource.weeklyCapacity;

                        return (
                            <div key={resource.id} className="grid grid-cols-[250px_1fr] divide-x group hover:bg-muted/20 transition-colors">
                                {/* Resource Info Col */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={resource.avatar} />
                                            <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{resource.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{resource.role}</p>
                                        </div>
                                    </div>

                                    {isOverloaded && (
                                        <div className="text-destructive flex items-center" title={`Over capacity: ${totalHours}/${resource.weeklyCapacity}h`}>
                                            <AlertTriangle className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-5 divide-x">
                                    {weekDays.map(day => {
                                        const allocation = getAllocation(resource.id, day);
                                        // D&D Placeholder: In a real drag-drop, this cell would be a droppable area
                                        // For now, click to allocate
                                        return (
                                            <div
                                                key={day.toString()}
                                                className="relative p-2 h-16 transition-colors hover:bg-muted/40 cursor-pointer"
                                                onClick={() => handleAddAllocation(resource.id, day)}
                                            >
                                                {allocation && (
                                                    <div className={cn(
                                                        "h-full rounded-md p-2 text-xs font-medium border flex flex-col justify-center items-center shadow-sm",
                                                        isOverloaded ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"
                                                    )}>
                                                        <span>{allocation.hours}h</span>
                                                    </div>
                                                )}
                                                {!allocation && (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100">
                                                        <Plus className="h-4 w-4 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
