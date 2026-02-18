'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

// Auth State Type
export type AuthState = {
    error?: string
    success?: boolean
    message?: string
}

// Login Action
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
    // Redirect throws, so we technically don't reach here, but for TS completeness:
    return {}
}

// Signup Action
export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const orgName = formData.get('org_name') as string

    console.log("Signup attempt for:", email);

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                org_name: orgName, // Pass org_name to metadata for the Trigger!
            },
        },
    })

    if (authError) {
        console.error("Signup Auth Error:", authError.message);
        return { error: authError.message, success: false, message: '' }
    }

    if (!authData.user) {
        console.error("Signup failed: No user returned");
        return { error: "Signup failed: No user returned.", success: false, message: '' }
    }

    console.log("Signup successful, user:", authData.user.id);

    // If email confirmation is ON, detailed logic needed.
    // If OFF, user is signed in.

    // Check if session exists to determine if auto-login happened
    if (authData.session) {
        console.log("Auto-login successful");
        // Auto-login successful
        revalidatePath('/', 'layout')
        redirect('/')
    } else {
        console.log("Email confirmation required");
        // Email confirmation required
        return {
            success: true,
            message: "Please check your email to confirm your account.",
            error: ''
        }
    }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
