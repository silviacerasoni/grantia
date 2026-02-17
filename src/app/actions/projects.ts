'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Project = {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    max_hours: number;
};

export type ResourceAllocation = {
    id: string;
    project_id: string;
    resource_id: string;
    resource_name: string;
    resource_avatar?: string;
    role: string;
    hours_allocated: number;
    week_start: string;
};

export async function createProject(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const orgId = "00000000-0000-0000-0000-000000000000"; // Replace with actual org ID retrieval

    const { error } = await supabase
        .from("projects")
        .insert({
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            organization_id: orgId,
            status: "active",
        });

    if (error) {
        console.error("Error creating project:", error);
        return { error: error.message };
    }

    revalidatePath("/projects");
    redirect("/projects");
}

export async function assignResource(projectId: string, resourceId: string, hours: number, weekStart: string) {
    // In a real app, this would upsert into a 'resource_allocations' table.
    // For this mock/prototype, we assume a table structure or just log it for now as the schema 
    // in step 328 defined 'project_resources' which is per-project, not per-week.
    // To support weekly planning (Gantt/Scheduler), we might need a more granular table or 
    // just update the 'project_resources' allocation_percentage.

    // Let's assume we are updating the aggregate allocation for simplicity or mocking the weekly interaction.

    const { error } = await supabase
        .from("project_resources")
        .upsert({
            project_id: projectId,
            user_id: resourceId,
            allocation_percentage: (hours / 40) * 100, // simplified conversion
        });

    if (error) {
        console.error("Error assigning resource:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
}
