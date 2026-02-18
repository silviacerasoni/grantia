"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAvailableUsers, addToProjectTeam } from "@/app/actions/planning";

type Props = {
    projectId: string;
    currentTeamIds: string[];
};

export function AddResourceDialog({ projectId, currentTeamIds }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            // Fetch users who are NOT in currentTeamIds
            // Ideally we fetch all and filter client side for small orgs, or filter server side.
            // Let's assume we fetch all from a new action `getAvailableUsers`
            getAvailableUsers()
                .then((users: any[]) => {
                    const filtered = users.filter((u: any) => !currentTeamIds.includes(u.id));
                    setAvailableUsers(filtered);
                })
                .catch((err: Error) => console.error(err));
        }
    }, [open, currentTeamIds]);

    const handleSubmit = async () => {
        if (!selectedUser) return;
        setIsLoading(true);

        const result = await addToProjectTeam(projectId, selectedUser);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Team member added");
            setOpen(false);
            router.refresh();
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Select a user to add to this project's resources.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">User</Label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.full_name || user.email || "Unknown"} ({user.role})
                                    </SelectItem>
                                ))}
                                {availableUsers.length === 0 && (
                                    <SelectItem value="none" disabled>No other users available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading || !selectedUser || availableUsers.length === 0}>
                        {isLoading ? "Adding..." : "Add to Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
