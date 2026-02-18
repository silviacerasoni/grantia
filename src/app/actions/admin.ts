'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
    const supabase = await createClient(); // Ideally verify admin role here

    // Check permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (requesterProfile?.role !== 'admin') {
        return { error: "Only admins can create users" };
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as string;
    const weeklyCapacity = parseInt(formData.get("weeklyCapacity") as string) || 40;

    // We can't use supabase.auth.admin.createUser without service role key in client constr
    // Check if we can use signUp (might require email confirm disabled or auto-confirm)
    // OR just tell user they need to sign up themselves?
    // USER REQUESTED: "add new resources in admin panel".
    // Usually admin wants to create them.
    // I'll try using a separate client with service role key if available in env, else fallback.

    // Actually, let's look for service role key usage pattern.
    // If not available, I can try signUp and immediately update profile.

    // For this prototype, let's assume we can just insert into profiles if we manually create auth user?
    // No, auth user needs to exist.

    // Let's try to use the admin client if connection allows, or just signUp.
    // If "Enable manual creation" is needed, usually requires service role.

    // Attempt with standard signup (will log me in as new user if not careful? No, signUp as second arg doesn't log in? Wait. signUp logs in on client. On server it returns session.)
    // Correct approach for Admin creating user is `supabase.auth.admin.createUser`.
    // I need to create a service role client.

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: "Server configuration error: Missing service role key." };
    }

    const adminSupabase = await createClient(); // This uses standard client! 
    // I need to make a new one.
    // Import createClient from supabase-js

    // Re-import locally to avoid conflict with utils
    const { createClient: createAdminClient } = require('@supabase/supabase-js');
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
        }
    });

    if (createError) {
        console.error("Create user error:", createError);
        return { error: createError.message };
    }

    if (!newUser.user) return { error: "Failed to create user object" };

    // Update Profile with Role and Capacity
    // The trigger might have created the profile already.
    // Let's update it.

    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            role: role || 'user',
            weekly_capacity: weeklyCapacity,
            // first_name/last_name don't exist in profiles table, only in metadata
            full_name: `${firstName} ${lastName}`
        })
        .eq('id', newUser.user.id);

    if (profileError) {
        console.error("Profile update error:", profileError);
        // Note: User is created in Auth but profile might be partial.
        return { error: "User created but profile update failed: " + profileError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function getUsers() {
    const supabase = await createClient();
    // Verify admin? RLS should handle it, but good to check.

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

    if (error) {
        console.error("Error fetching users:", error);
        return [];
    }

    return users;
}

export async function deleteUser(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (requesterProfile?.role !== 'admin') {
        return { error: "Only admins can delete users" };
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { error: "Server config error" };

    const { createClient: createAdminClient } = require('@supabase/supabase-js');
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
        // If Auth user not found, strict cleanup: delete the profile manually
        if (error.message.includes("User not found") || error.status === 404) {
            console.log("Auth user not found, cleaning up profile...");
            const { error: deleteProfileError } = await adminClient
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (deleteProfileError) {
                return { error: "Failed to delete orphaned profile: " + deleteProfileError.message };
            }
            // Success cleanup
        } else {
            return { error: error.message };
        }
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (requesterProfile?.role !== 'admin') {
        return { error: "Only admins can update roles" };
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { error: "Server config error" };

    const { createClient: createAdminClient } = require('@supabase/supabase-js');
    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // Update profile role
    const { error } = await adminClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
