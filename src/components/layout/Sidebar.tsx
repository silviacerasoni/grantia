"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Clock, Landmark, FileText, Settings, ShieldCheck, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signout } from "@/app/auth/actions"; // Server Action

interface SidebarProps {
    userProfile: {
        full_name: string;
        role: string;
        email: string;
    } | null;
}

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Timesheets', path: '/timesheets', icon: Clock },
    { name: 'Approvals', path: '/approvals', icon: Check },
    { name: 'Finance & Costs', path: '/finance', icon: Landmark },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ userProfile }: SidebarProps) {
    const pathname = usePathname();

    // Get initials
    const initials = userProfile?.full_name
        ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-full bg-white dark:bg-zinc-950">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Landmark className="w-8 h-8" />
                    <span>Grantia</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">EU Project Management</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        asChild
                        variant={pathname === item.path ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3",
                            pathname === item.path && "bg-primary/10 text-primary hover:bg-primary/20",
                            pathname !== item.path && "text-muted-foreground"
                        )}
                    >
                        <Link href={item.path}>
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    </Button>
                ))}
                {/* Dynamic Admin Link */}
                {userProfile?.role === 'admin' && (
                    <div className="pt-4 border-t border-border mt-2">
                        <Button
                            asChild
                            variant={pathname.startsWith('/admin') ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 text-destructive hover:text-destructive",
                                pathname.startsWith('/admin') && "bg-destructive/10"
                            )}
                        >
                            <Link href="/admin">
                                <ShieldCheck className="w-5 h-5" />
                                Admin Panel
                            </Link>
                        </Button>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-border space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{userProfile?.full_name || 'Guest'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userProfile?.role || 'User'}</p>
                    </div>
                </div>

                <form action={signout}>
                    <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" size="sm">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </aside>
    );
}
