'use client'

import { login, type AuthState } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

const initialState: AuthState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground">Login to your account</p>
                </div>

                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive font-medium text-center">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="m@example.com" disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-xs hover:underline">Forgot password?</Link>
                        </div>
                        <Input id="password" name="password" type="password" required disabled={isPending} />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : "Sign in"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline">Sign up</Link>
                </div>
            </div>
        </div>
    )
}
