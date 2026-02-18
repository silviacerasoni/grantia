'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type TimesheetEntry = {
    id?: string;
    project_id: string;
    activity_id?: string;
    user_id: string;
    date: string;
    hours: number;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
};

// Bulk Upsert for AutoSave or Submit
export async function upsertTimesheetEntries(entries: TimesheetEntry[]) {
    const { data, error } = await supabase
        .from('timesheets')
        .upsert(entries, { onConflict: 'user_id, project_id, date' }) // Assuming a unique constraint or handling via ID
        .select();

    if (error) {
        console.error('Error upserting timesheets:', error);
        return { error: error.message };
    }

    revalidatePath('/timesheets');
    return { data };
}

// Fetch for Grid
export async function getWeeklyTimesheets(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
        .from('timesheets')
        .select(`
      *,
      projects (name),
      project_activities (name)
    `)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        console.error('Error fetching timesheets:', error);
        return [];
    }
    return data;
}

// PM: Get Pending Approvals
export async function getPendingApprovals() {
    // In real app, filter by PM's org or projects
    const { data, error } = await supabase
        .from('timesheets')
        .select(`
        *,
        profiles (full_name, avatar_url),
        projects (name),
        project_activities (name)
      `)
        .eq('status', 'pending')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching approvals:', error);
        return [];
    }
    return data;
}

// PM: Approve Batch
export async function approveTimesheetBatch(ids: string[], approverId: string) {
    const { error } = await supabase
        .from('timesheets')
        .update({
            status: 'approved',
            approved_by: approverId,
            approved_at: new Date().toISOString()
        })
        .in('id', ids);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/approvals');
    return { success: true };
}

// PM: Reject Single
export async function rejectTimesheetEntry(id: string, reason: string, approverId: string) {
    const { error } = await supabase
        .from('timesheets')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            approved_by: approverId,
            approved_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/approvals');
    return { success: true };
}
