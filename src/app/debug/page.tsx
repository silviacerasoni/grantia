import { createClient } from "@/utils/supabase/server";
import { DebugProjectForm } from "@/components/debug/DebugProjectForm";

export default async function DebugPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    let projects = [];
    let org = null;

    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profile = data;

        if (profile?.organization_id) {
            const { data: o } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).single();
            org = o;
        }

        const { data: p } = await supabase.from('projects').select('*'); // Should be filtered by RLS
        projects = p || [];
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug Info</h1>
            <pre className="bg-muted p-4 rounded overflow-auto">
                User: {JSON.stringify(user, null, 2)}
            </pre>
            <pre className="bg-muted p-4 rounded overflow-auto">
                Profile: {JSON.stringify(profile, null, 2)}
            </pre>
            <pre className="bg-muted p-4 rounded overflow-auto">
                Organization: {JSON.stringify(org, null, 2)}
            </pre>
            <pre className="bg-muted p-4 rounded overflow-auto">
                Visible Projects: {JSON.stringify(projects, null, 2)}
            </pre>

            <DebugProjectForm />
        </div>
    );
}
