import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Serialize profile for client component safely
    const userProfile = profile ? {
        full_name: profile.full_name,
        role: profile.role,
        email: profile.email
    } : {
        full_name: user.email || 'User',
        role: 'user',
        email: user.email || ''
    };

    return (
        <div className="flex h-screen bg-muted/40">
            <Sidebar userProfile={userProfile} />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
