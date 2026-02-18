import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, User, CreditCard } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourcePlanner } from "@/components/features/ResourcePlanner";
import { BudgetManager } from "@/components/features/BudgetManager";
import { ExpenseUploader } from "@/components/features/ExpenseUploader";
import { ExpenseTable } from "@/components/features/ExpenseTable";
import { DeleteProjectButton } from "@/components/features/DeleteProjectButton";
import { EditProjectDialog } from "@/components/features/EditProjectDialog";
import { ActivityManager } from "@/components/features/ActivityManager";
import { ProjectGanttChart } from "@/components/features/ProjectGanttChart";
import { AddResourceDialog } from "@/components/features/AddResourceDialog";
import { createClient } from "@/utils/supabase/server";
import { getProjectBudgets } from "@/app/actions/finance";
import { getProjectActivities, getProjectTeam, getOrganizationAllocations } from "@/app/actions/planning";

type Props = {
    params: Promise<{ id: string }>;
};

// Next.js 15+ allows async params
export default async function ProjectPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch project details with coordinator name
    const { data: project, error } = await supabase
        .from('projects')
        .select('*, coordinator:profiles!coordinator_id(full_name)')
        .eq('id', id)
        .single();

    if (error || !project) {
        notFound();
    }

    // Fetch all users for the edit dialog
    const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

    // Fetch categories server-side for initial render and sync
    const categories = await getProjectBudgets(id);

    // Fetch planning data
    const activities = await getProjectActivities(id);
    const team = await getProjectTeam(id);

    // Get allocations for the team across ALL projects to show availability
    const teamIds = team.map((u: any) => u.id);
    const today = new Date();
    const startWindow = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0]; // -1 month
    const endWindow = new Date(today.getFullYear(), today.getMonth() + 6, 1).toISOString().split('T')[0]; // +6 months

    // Use getOrganizationAllocations if team exists
    let allocations: any[] = [];
    if (teamIds.length > 0) {
        allocations = await getOrganizationAllocations(teamIds, startWindow, endWindow);
    }

    // Formatters
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/projects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-sm text-muted-foreground">{project.code || 'No Code'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <EditProjectDialog project={project} users={users || []} />
                    <DeleteProjectButton projectId={project.id} />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="finance">Finance & Budget</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Project Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed min-h-[64px]">
                                    {project.description || "No description provided."}
                                </p>

                                <div className="flex flex-col gap-6 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Timeline</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(project.start_date)} - {formatDate(project.end_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Total Budget</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(project.total_budget || 0)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Coordinator</p>
                                            <p className="text-xs text-muted-foreground">
                                                {project.coordinator?.full_name || 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Manager embedded in Overview */}
                        <ActivityManager projectId={id} activities={activities || []} />
                    </div>

                    {/* Gantt Chart spanning full width */}
                    <ProjectGanttChart activities={activities || []} />
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                    <div className="flex justify-end">
                        <AddResourceDialog projectId={id} currentTeamIds={team.map((u: any) => u.id)} />
                    </div>
                    <ResourcePlanner
                        projectId={id}
                        activities={activities || []}
                        team={team || []}
                        allocations={allocations || []}
                    />
                </TabsContent>

                <TabsContent value="finance" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Budget Management */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Budget Manager manages adding/removing categories */}
                            <BudgetManager projectId={project.id} />

                            {/* Expense List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Expenses</CardTitle>
                                    <CardDescription>Latest approved and pending expenses.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ExpenseTable projectId={id} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Upload */}
                        <div>
                            {/* Pass server-fetched categories to Uploader so it stays in sync via revalidatePath */}
                            <ExpenseUploader projectId={project.id} categories={categories} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
