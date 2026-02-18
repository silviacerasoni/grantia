"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { upsertTimesheetEntries, TimesheetEntry } from "@/app/actions/timesheets";

// Mock Projects for MVP
const PROJECTS = [
    { id: 'p1', name: 'Sustainable Urban Mobility', activity: 'WP1 - Project Management' },
    { id: 'p2', name: 'Sustainable Urban Mobility', activity: 'WP2 - AI Model Dev' },
];

export function TimesheetGrid() {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [entries, setEntries] = useState<TimesheetEntry[]>([]);
    const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Build days array for columns
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

    // Load initial data (mock for now, would be useEffect fetching from server action)
    useEffect(() => {
        // simulate fetch
        setEntries([]);
    }, [currentWeekStart]);

    const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

    const getHours = (projectId: string, date: Date) => {
        const entry = entries.find(e => e.project_id === projectId && isSameDay(new Date(e.date), date));
        return entry?.hours || '';
    };

    const handleHoursChange = (projectId: string, date: Date, value: string) => {
        const numValue = parseFloat(value);
        if (value !== '' && (isNaN(numValue) || numValue < 0 || numValue > 24)) return;

        const dateStr = format(date, 'yyyy-MM-dd');

        setEntries(prev => {
            const existingIndex = prev.findIndex(e => e.project_id === projectId && e.date === dateStr);
            const newEntry: TimesheetEntry = {
                project_id: projectId,
                user_id: 'current-user-id', // would come from auth context
                date: dateStr,
                hours: value === '' ? 0 : numValue,
                status: 'draft'
            };

            if (existingIndex >= 0) {
                const newEntries = [...prev];
                newEntries[existingIndex] = newEntry;
                return newEntries;
            } else {
                return [...prev, newEntry];
            }
        });

        setSavingStatus('idle'); // Trigger save on debounce
    };

    // Debounced AutoSave
    useEffect(() => {
        if (entries.length === 0) return;

        const timeout = setTimeout(async () => {
            setSavingStatus('saving');
            // In real app, filter for only 'draft' or dirty entries
            const dirtyEntries = entries.filter(e => e.status === 'draft');
            if (dirtyEntries.length > 0) {
                await upsertTimesheetEntries(dirtyEntries);
                setSavingStatus('saved');
                // Update local status to pending/saved
                setEntries(prev => prev.map(e => dirtyEntries.find(d => d.date === e.date && d.project_id === e.project_id) ? { ...e, status: 'pending' } : e));
            } else {
                setSavingStatus('idle');
            }
        }, 1500);

        return () => clearTimeout(timeout);
    }, [entries]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="font-medium text-sm w-40 text-center">
                        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {savingStatus === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>}
                    {savingStatus === 'saved' && <><Check className="h-3 w-3 text-green-500" /> Saved</>}
                    <Button size="sm">Submit Week</Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Project / Activity</TableHead>
                            {weekDays.map(day => (
                                <TableHead key={day.toString()} className="text-center min-w-[60px]">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-normal text-muted-foreground">{format(day, 'EEE')}</span>
                                        <span className="font-medium">{format(day, 'd')}</span>
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-center w-[80px]">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PROJECTS.map(project => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{project.name}</span>
                                        <span className="text-xs text-muted-foreground font-normal">{project.activity}</span>
                                    </div>
                                </TableCell>
                                {weekDays.map(day => (
                                    <TableCell key={day.toString()} className="p-1">
                                        <Input
                                            className={cn(
                                                "h-8 text-center border-transparent hover:border-input focus:border-input transition-colors",
                                                isSameDay(day, new Date()) ? "bg-accent/20" : ""
                                            )}
                                            placeholder="-"
                                            value={getHours(project.id, day)}
                                            onChange={(e) => handleHoursChange(project.id, day, e.target.value)}
                                        />
                                    </TableCell>
                                ))}
                                <TableCell className="text-center font-bold text-muted-foreground">
                                    {entries.filter(e => e.project_id === project.id).reduce((sum, e) => sum + (Number(e.hours) || 0), 0)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
