'use client'

import { signup, type AuthState } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useActionState } from 'react' // React 19 / Next 15+
import { Loader2 } from 'lucide-react'

// Initial state for the form
const initialState: AuthState = {
    error: '',
    success: false,
    message: ''
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground">Start managing your EU projects</p>
                </div>

                {state?.success ? (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-800 text-center">
                        <h3 className="font-semibold mb-1">Account Created!</h3>
                        <p className="text-sm">{state.message}</p>
                        <p className="text-sm mt-2">
                            <Link href="/login" className="underline font-medium">Proceed to Login</Link>
                        </p>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-4">
                        {state?.error && (
                            <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive font-medium text-center">
                                {state.error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" required placeholder="John Doe" disabled={isPending} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org_name">Organization Name</Label>
                            <Input id="org_name" name="org_name" required placeholder="Acme Research Institute" disabled={isPending} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="m@example.com" disabled={isPending} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required minLength={6} disabled={isPending} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                )}

                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">Login</Link>
                </div>
            </div>
        </div>
    )
}
