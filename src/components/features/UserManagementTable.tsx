"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, UserCog, Trash2 } from "lucide-react";
import { AddUserDialog } from "@/components/features/AddUserDialog";
import { updateUserRole, deleteUser } from "@/app/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    weekly_capacity: number | null;
    created_at: string;
};

export function UserManagementTable({ users }: { users: Profile[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setIsLoading(userId);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.error) {
                toast.error(`Error: ${result.error}`);
            } else {
                toast.success(`Role updated to ${newRole}`);
                router.refresh();
            }
        } catch (e) {
            toast.error("Failed to update role");
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        setIsLoading(userId);
        try {
            const result = await deleteUser(userId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("User deleted");
                router.refresh();
            }
        } catch (e) {
            toast.error("Failed to delete user");
        } finally {
            setIsLoading(null);
        }
    };

    const getRoleBadgeColor = (role: string | null) => {
        switch (role) {
            case 'admin': return 'destructive'; // Red
            case 'manager': return 'default'; // Primary/Black
            case 'accountant': return 'secondary'; // Gray
            default: return 'outline'; // Outline
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <AddUserDialog />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                            {user.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.full_name || 'Unknown'}</div>
                                            {/* Note: email is not consistently in profile, but if it were: */}
                                            {/* <div className="text-xs text-muted-foreground">{user.email}</div> */}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getRoleBadgeColor(user.role) as any}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {user.weekly_capacity || 40}h/week
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading === user.id}>
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'admin')}>
                                                <Shield className="mr-2 h-4 w-4" /> Make Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'manager')}>
                                                <UserCog className="mr-2 h-4 w-4" /> Make Manager
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, 'user')}>
                                                <UserCog className="mr-2 h-4 w-4" /> Make Employee
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
