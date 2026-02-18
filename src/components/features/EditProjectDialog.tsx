"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/app/actions/projects";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Ensure these are exported from @/components/ui/select

type Project = {
    id: string;
    name: string;
    code: string;
    description: string;
    start_date: string;
    end_date: string;
    total_budget: number;
    coordinator_id?: string;
};

type User = {
    id: string;
    full_name: string;
};

import { formatCurrency, parseCurrency, formatCurrencyInput } from "@/lib/utils";

// ... existing code ...

export function EditProjectDialog({ project, users }: { project: Project; users: User[] }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [budgetDisplay, setBudgetDisplay] = useState(project.total_budget ? formatCurrency(project.total_budget) : "");

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const formatted = formatCurrencyInput(val);
        setBudgetDisplay(formatted);
    };

    // Add blur handler to ensure correct format on exit
    const handleBudgetBlur = () => {
        const numeric = parseCurrency(budgetDisplay);
        if (numeric) {
            setBudgetDisplay(formatCurrency(numeric));
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateProject(project.id, formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Project updated");
            setOpen(false);
            router.refresh();
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Make changes to your project here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" defaultValue={project.name} className="col-span-3" required />
                        </div>

                        {/* Code */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">Code</Label>
                            <Input id="code" name="code" defaultValue={project.code} className="col-span-3" />
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" name="description" defaultValue={project.description} className="col-span-3" />
                        </div>

                        {/* Coordinator */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="coordinatorId" className="text-right">Coordinator</Label>
                            <div className="col-span-3">
                                <Select name="coordinatorId" defaultValue={project.coordinator_id || (users.length > 0 ? users[0].id : undefined)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select coordinator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users && users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start</Label>
                            <Input id="startDate" name="startDate" type="date" defaultValue={project.start_date} className="col-span-3" />
                        </div>

                        {/* End Date */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">End</Label>
                            <Input id="endDate" name="endDate" type="date" defaultValue={project.end_date} className="col-span-3" />
                        </div>

                        {/* Budget */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budgetDisplay" className="text-right">Budget (€)</Label>
                            <div className="col-span-3 relative">
                                <Input
                                    id="budgetDisplay"
                                    name="budgetDisplay"
                                    value={budgetDisplay}
                                    onChange={handleBudgetChange}
                                    onBlur={handleBudgetBlur}
                                    placeholder="0"
                                />
                                <input type="hidden" name="budget" value={parseCurrency(budgetDisplay)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
