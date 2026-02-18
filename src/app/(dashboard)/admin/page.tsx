import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Settings } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/users">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            User Management
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage Users</div>
                        <p className="text-xs text-muted-foreground">
                            View list, update roles, promote/demote staff.
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Card className="opacity-50 pointer-events-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        System Configuration
                    </CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Global Settings</div>
                    <p className="text-xs text-muted-foreground">
                        Coming soon: Configure global parameters.
                    </p>
                </CardContent>
            </Card>

            <Card className="opacity-50 pointer-events-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Audit Logs
                    </CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Security Audit</div>
                    <p className="text-xs text-muted-foreground">
                        Review system access and critical actions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
