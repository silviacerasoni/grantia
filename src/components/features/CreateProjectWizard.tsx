"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject } from "@/app/actions/projects";
import { useRouter } from "next/navigation";
import { CalendarIcon, ChevronRight, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STEPS = [
    { number: 1, title: "Basics", description: "Project Core Info" },
    { number: 2, title: "Dates & Budget", description: "Timeline & Calls" },
    { number: 3, title: "Objectives", description: "Goals & Description" },
];

export function CreateProjectWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        startDate: "",
        endDate: "",
        budget: "",
        description: "",
        objectives: ""
    });

    const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));

        try {
            const result = await createProject(data);

            if (result?.error) {
                alert(`SERVER ERROR: ${result.error}\nDetails: ${JSON.stringify(result.details)}`);
                setIsSubmitting(false);
                return;
            }

            if (result?.success) {
                router.push('/projects');
                router.refresh();
            } else {
                alert("Unknown response from server: " + JSON.stringify(result));
                setIsSubmitting(false);
            }
        } catch (e: any) {
            alert(`CLIENT EXCEPTION: ${e.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Stepper Header */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -z-10 -translate-y-1/2" />
                {STEPS.map((s) => (
                    <div key={s.number} className="flex flex-col items-center bg-background px-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 mb-2",
                            step >= s.number
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-muted-foreground/30"
                        )}>
                            {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                        </div>
                        <span className={cn("text-xs font-medium", step >= s.number ? "text-foreground" : "text-muted-foreground")}>
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[step - 1].title}</CardTitle>
                    <CardDescription>{STEPS[step - 1].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Horizon 2025: EcoMobility"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Grant Agreement / Call Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. GA-10101-EU"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget">Total Requested Budget (€)</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Short Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Brief summary of the project scope..."
                                    className="min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        Back
                    </Button>

                    {step < STEPS.length ? (
                        <Button onClick={handleNext}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
