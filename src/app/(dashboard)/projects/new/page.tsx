import { CreateProjectWizard } from "@/components/features/CreateProjectWizard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/projects">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                    <p className="text-muted-foreground">Setup a new grant project with objectives and initial planning.</p>
                </div>
            </div>

            <CreateProjectWizard />
        </div>
    );
}
