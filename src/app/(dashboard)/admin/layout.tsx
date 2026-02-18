import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify Admin Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        // Redirect to dashboard if not admin
        redirect('/');
    }

    return (
        <div className="flex flex-col h-full">
            <header className="px-6 py-4 border-b bg-muted/40 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Admin Administration</h2>
                <div className="text-sm text-muted-foreground">System Management</div>
            </header>
            <div className="flex-1 p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
