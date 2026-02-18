import { getUsers } from "@/app/actions/admin";
import { UserManagementTable } from "@/components/features/UserManagementTable";

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                    Manage system users and their roles.
                </p>
            </div>

            <UserManagementTable users={users} />
        </div>
    );
}
