"use client";

import { useState } from "react";
import { debugCreateProject } from "@/app/actions/debug";
import { Button } from "@/components/ui/button";

export function DebugProjectForm() {
    const [result, setResult] = useState<any>(null);

    const handleTest = async () => {
        setResult("Running...");
        const res = await debugCreateProject();
        setResult(res);
    };

    return (
        <div className="border p-4 rounded bg-background">
            <h3 className="font-bold mb-2">Test Project Creation</h3>
            <Button onClick={handleTest}>Create "Debug Project"</Button>
            <pre className="mt-4 bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
            </pre>
            {result?.success && <p className="text-green-600 font-bold mt-2">Success! Refresh to see in list.</p>}
        </div>
    );
}
