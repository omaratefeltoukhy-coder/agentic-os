"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
  ACCOUNT_SUSPENDED: "This account has been suspended. Contact support.",
  CredentialsSignin: "Incorrect email or password.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? "Incorrect email or password.");
        return;
      }
      // Full navigation so the header picks up the freshly-created session.
      window.location.assign("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-sand">Welcome back</h1>
      <p className="mt-1 text-sm text-sand-dim">Log in to manage bookings and your profile.</p>

      {justVerified && (
        <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Email verified — log in to continue.
        </p>
      )}

      <div className="mt-5">
        <GoogleButton callbackUrl="/dashboard" />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-sand-dim">
        <div className="h-px flex-1 bg-petrol-lighter" />
        or with email
        <div className="h-px flex-1 bg-petrol-lighter" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="mb-1.5 text-xs text-gold hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <FieldError message={error ?? undefined} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-sand-dim">
        New to GulfPaws?{" "}
        <Link href="/signup" className="font-medium text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
