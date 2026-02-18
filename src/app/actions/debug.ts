'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function debugCreateProject() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { message: "No User" };

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.organization_id) return { message: "No Org ID", profile };

        const payload = {
            name: `Debug Project ${new Date().toISOString()}`,
            description: "Generated for debugging",
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            organization_id: profile.organization_id,
            status: "active",
            total_budget: 1000
        };

        const { data, error } = await supabase.from('projects').insert(payload).select().single();

        if (error) {
            return { success: false, error: error, message: error.message, code: error.code, details: error.details };
        }

        revalidatePath('/debug');
        return { success: true, data };

    } catch (e: any) {
        return { success: false, error: e, message: e.message };
    }
}
