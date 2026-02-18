'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createActivity(projectId: string, data: { name: string; start_date?: string; end_date?: string; budget?: number }) {
    const supabase = await createClient();

    // Check permissions (Manager/Admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Insert
    const { error } = await supabase
        .from('project_activities')
        .insert({
            project_id: projectId,
            name: data.name,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            budget_allocated: data.budget || 0
        });

    if (error) {
        console.error("Create Activity Error:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function getProjectActivities(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_activities')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

    if (error) return [];
    return data;
}

export async function getProjectTeam(projectId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch users assigned to the project via project_resources
    const { data: resources, error } = await supabase
        .from('project_resources')
        .select(`
            user_id,
            profiles:user_id (
                id,
                full_name,
                email,
                role,
                weekly_capacity
            )
        `)
        .eq('project_id', projectId);

    if (error) {
        console.error("Error fetching project team:", error);
        return [];
    }

    // Flatten the result to return an array of profiles
    // @ts-ignore
    return resources.map(r => r.profiles).filter(Boolean);
}

export type AllocationInput = {
    user_id: string;
    activity_id: string;
    week_start_date: string;
    hours: number;
};

export async function upsertAllocations(projectId: string, allocations: AllocationInput[]) {
    const supabase = await createClient();

    // Loop or bulk upsert. Supabase support bulk upsert.
    // We need to inject project_id into each record for RLS policies (if setup that way)
    // My RLS checks project_id, so it must be present.

    const records = allocations.map(a => ({
        ...a,
        project_id: projectId
    }));

    const { error } = await supabase
        .from('resource_allocations')
        .upsert(records, { onConflict: 'user_id, activity_id, week_start_date' });

    if (error) {
        console.error("Upsert Allocation Error:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function getProjectAllocations(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('resource_allocations')
        .select('*')
        .eq('project_id', projectId);

    if (error) return [];
    return data;
}

export async function getOrganizationAllocations(userIds: string[], weekStart: string, weekEnd: string) {
    const supabase = await createClient();

    // Fetch allocations for these users in the given date range
    // Across ALL projects (RLS allows viewing org data)
    const { data, error } = await supabase
        .from('resource_allocations')
        .select('user_id, week_start_date, hours, project_id, activity_id')
        .in('user_id', userIds)
        .gte('week_start_date', weekStart)
        .lte('week_start_date', weekEnd);

    if (error) {
        console.error("Error fetching org allocations:", error);
        return [];
    }
    return data;
}

export async function getAvailableUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name');

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }
    return data;
}

export async function addToProjectTeam(projectId: string, userId: string) {
    const supabase = await createClient();

    // Check permissions (manager/admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Insert into project_resources
    const { error } = await supabase
        .from('project_resources')
        .insert({
            project_id: projectId,
            user_id: userId,
            role_in_project: 'Member',
            allocation_percentage: 100
        });

    if (error) {
        if (error.code === '23505') return { error: "User already in team" };
        console.error("Error adding to team:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}
