'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Project = {
    id: string;
    organization_id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    code?: string;
    total_budget?: number;
    status: 'draft' | 'active' | 'completed';
    coordinator_id?: string;
    coordinator?: {
        full_name: string;
        avatar_url?: string;
    };
};


export type ResourceAllocation = {
    id: string;
    project_id: string;
    resource_id: string;
    week_start: string;
    hours: number;
    resource_name?: string;
    resource_avatar?: string;
    resource_role?: string;
    resource_capacity?: number;
};

export async function createProject(formData: FormData) {
    const supabase = await createClient(); // Use server client

    // 1. Get Auth User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // 2. Get User's Organization
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.organization_id) {
        return { error: "User does not belong to an organization." };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const code = formData.get("code") as string;
    const budget = formData.get("budget") ? parseFloat(formData.get("budget") as string) : 0;
    const objectives = formData.get("objectives") as string; // Capture objectives if form sends it

    const { data, error } = await supabase
        .from("projects")
        .insert({
            name,
            description,
            code,
            total_budget: budget,
            start_date: startDate || null,
            end_date: endDate || null,
            organization_id: profile.organization_id, // ALL INSERT MUST MATCH AUTH ORG FOR RLS
            status: "active",
            // If objectives column exists, add it: objectives: objectives
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating project:", error);
        return { error: error.message, details: error.details };
    }

    revalidatePath("/projects");
    return { success: true, project: data };
}


export async function getResourceAllocations(weekStart: Date) {
    const supabase = await createClient(); // FIX: Use server client
    const formattedDate = weekStart.toISOString().split('T')[0];

    // Get all allocations for the week across all projects in the org
    // In a real scenario, filter by Organization
    const { data, error } = await supabase
        .from('resource_allocations')
        .select(`
            *,
            profiles (full_name, avatar_url, role),
            projects (name)
        `)
        .eq('week_start_date', formattedDate);

    if (error) {
        console.error("Error fetching allocations:", error);
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        project_id: item.project_id,
        resource_id: item.user_id,
        week_start: item.week_start_date,
        hours: item.hours,
        resource_name: item.profiles?.full_name,
        resource_avatar: item.profiles?.avatar_url,
        resource_role: item.profiles?.role
    }));
}

export async function updateResourceAllocation(projectId: string, resourceId: string, weekStart: Date, hours: number) {
    const supabase = await createClient(); // FIX: Use server client
    const formattedDate = weekStart.toISOString().split('T')[0];

    const { error } = await supabase
        .from("resource_allocations")
        .upsert({
            project_id: projectId,
            user_id: resourceId,
            week_start_date: formattedDate,
            hours: hours
        }, { onConflict: 'project_id, user_id, week_start_date' });

    if (error) {
        console.error("Error updating allocation:", error);
        return { error: error.message };
    }

    revalidatePath("/projects");
    return { success: true };
}

export async function getOrganizationMembers() {
    const supabase = await createClient(); // FIX: Use server client
    // In real app, filter by current user's org
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

    if (error) {
        console.error("Error fetching members:", error);
        return [];
    }
    return data;
}


export async function deleteProject(projectId: string) {
    const supabase = await createClient();

    // Check permissions (Manager/Admin only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Get user role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
        return { error: "Insufficient permissions" };
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error("Error deleting project:", error);
        return { error: error.message };
    }

    revalidatePath("/projects");
    return { success: true };
}


export async function updateProject(projectId: string, formData: FormData) {
    const supabase = await createClient();

    // Check permissions (Manager/Admin only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
        return { error: "Insufficient permissions" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const code = formData.get("code") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const budget = formData.get("budget") ? parseFloat(formData.get("budget") as string) : 0;
    const coordinatorId = formData.get("coordinatorId") as string;

    const updates: any = {
        name,
        description,
        code,
        start_date: startDate || null,
        end_date: endDate || null,
        total_budget: budget
    };

    if (coordinatorId && coordinatorId !== 'undefined') {
        updates.coordinator_id = coordinatorId;
    }

    const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq('id', projectId);

    if (error) {
        console.error("Error updating project:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    return { success: true };
}
