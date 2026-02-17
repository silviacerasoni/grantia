"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Clock, Landmark, FileText, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Timesheets', path: '/timesheets', icon: Clock },
    { name: 'Finance & Costs', path: '/finance', icon: Landmark },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Compliance', path: '/compliance', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-full bg-white dark:bg-zinc-950">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Landmark className="w-8 h-8" />
                    <span>Grantia</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">EU Project Management</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
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
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary">ER</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">Dr. Elena Rossi</p>
                        <p className="text-xs text-muted-foreground">Senior Researcher</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
