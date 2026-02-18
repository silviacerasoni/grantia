'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type BudgetCategory = {
    id: string;
    project_id: string;
    name: string;
    allocated_amount: number;
    spent_amount?: number; // Calculated field
};

export type ExpenseRecord = {
    id: string;
    project_id: string;
    category_id?: string;
    user_id: string;
    category: string; // Legacy/Fallback
    description: string;
    amount: number;
    vat_rate: number;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    payment_status: 'pending_payment' | 'paid' | 'reconciled';
    budget_category?: { name: string };
    profiles?: { full_name: string };
};

export async function createBudgetCategory(projectId: string, name: string, amount: number) {
    const { error } = await supabase
        .from('project_budget_categories')
        .insert({
            project_id: projectId,
            name,
            allocated_amount: amount
        });

    if (error) {
        console.error("Error creating budget category:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function getProjectBudgets(projectId: string) {
    // 1. Get Categories
    const { data: categories, error } = await supabase
        .from('project_budget_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

    if (error) {
        console.error("Error fetching budgets:", error);
        return [];
    }

    // 2. Get Expenses grouped by category (or fetch all and aggregate)
    // For simplicity in this demo, we'll fetch all expenses for the project and map them properly.
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category_id, category')
        .eq('project_id', projectId);

    const expensesList = expenses || [];

    // 3. Merge Data
    const budgets = categories.map((cat: any) => {
        // Sum expenses that match this category ID (or name fallback)
        const spent = expensesList
            .filter((e: any) => e.category_id === cat.id || e.category === cat.name)
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

        return {
            ...cat,
            spent_amount: spent
        };
    });

    return budgets as BudgetCategory[];
}

export async function deleteBudgetCategory(id: string, projectId: string) {
    const { error } = await supabase
        .from('project_budget_categories')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function logExpense(formData: FormData) {
    const projectId = formData.get("projectId") as string;
    const categoryId = formData.get("categoryId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const vatRate = parseFloat(formData.get("vatRate") as string) || 0;
    const description = formData.get("description") as string;
    // const date = formData.get("date") as string || new Date().toISOString();
    const date = new Date().toISOString(); // Simple default for now

    // In a real app, we would get the user ID from the session
    // const { data: { user } } = await supabase.auth.getUser();

    // For demo, we'll fetch a valid user profile like we did for Org
    let userId = null;
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();

    if (profile) {
        userId = profile.id;
    } else {
        // Fallback if NO profiles checks out (should not happen after patch, but safety first)
        // If we can't find a profile, checking if we can use a hardcoded one or fail gracefully
        // We will return an error instructing to run the patch
        return { error: "No user profile found. Please run patch_fix_profiles.sql" };
    }

    // Create the expense record
    // Note: We need to create the 'expenses' table column 'category_id' if it doesn't exist, which we did in the SQL patch.
    const { error } = await supabase
        .from('expenses')
        .insert({
            project_id: projectId,
            category_id: categoryId,
            user_id: userId, // Using the first found profile for demo
            category: "Dynamic", // Fallback/Legacy
            amount,
            vat_rate: vatRate,
            description,
            date,
            status: 'pending' // Default status
        });

    if (error) {
        console.error("Error logging expense:", error);
        return { error: error.message };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
}

export async function getProjectExpenses(projectId: string) {
    // If projectId is not provided (e.g. overview dashboard), fetch all? Or return empty.
    let query = supabase
        .from('expenses')
        .select(`
            *,
            project_budget_categories (name),
            profiles (full_name)
        `)
        .order('date', { ascending: false });

    if (projectId) {
        query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }

    // Map to friendly format
    return data.map((item: any) => ({
        ...item,
        category: item.project_budget_categories?.name || item.category || 'Uncategorized',
        user_name: item.profiles?.full_name || 'Unknown User'
    }));
}
