"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSubmitted(true);
                toast.success("Reset email sent (if account exists)");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Check your email
                    </h2>
                    <p className="text-muted-foreground">
                        If an account exists for {email}, we have sent a password reset link.
                    </p>
                    <div className="mt-4">
                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                Return to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Enter your email to request a password reset
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
