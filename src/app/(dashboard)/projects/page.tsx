import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";

async function getProjects() {
    // Fetch projects from Supabase using authenticated client
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
    return data;
}

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your grant applications and active projects.</p>
                </div>
                <Link href="/projects/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: any) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {project.code || 'NO-CODE'}
                                </CardTitle>
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate">{project.name}</div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {project.description || "No description provided."}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                        {project.status || 'Draft'}
                                    </Badge>
                                    {project.total_budget > 0 && (
                                        <Badge variant="outline">
                                            €{project.total_budget.toLocaleString()}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {/* Empty State */}
                {projects.length === 0 && (
                    <Card className="flex flex-col items-center justify-center p-8 text-center h-[200px] border-dashed">
                        <FolderKanban className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold">No projects found</h3>
                        <p className="text-sm text-muted-foreground mb-4">Get started by creating your first project.</p>
                        <Link href="/projects/new">
                            <Button variant="outline">Create Project</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}
