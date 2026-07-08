"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { GULF_PHONE_CODES } from "@/lib/constants/gulf";

type Role = "OWNER" | "CAREGIVER";

export function SignupForm({
  initialRole,
  referralCode,
}: {
  initialRole: Role;
  referralCode?: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneCountryCode,
          phoneNumber,
          whatsappOptIn,
          role,
          referralCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setStep("verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?verified=1");
        return;
      }

      // Full navigation so the header picks up the freshly-created session.
      window.location.assign(role === "CAREGIVER" ? "/onboarding/caregiver" : "/browse");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    await fetch("/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "EMAIL_VERIFY" }),
    });
  }

  if (step === "verify") {
    return (
      <Card>
        <h1 className="font-display text-2xl font-bold text-sand">Check your email</h1>
        <p className="mt-2 text-sm text-sand-dim">
          We sent a 6-digit code to <span className="text-sand">{email}</span>.
        </p>
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
              autoFocus
            />
          </div>
          <FieldError message={error ?? undefined} />
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Verifying…" : "Verify & continue"}
          </Button>
          <button
            type="button"
            onClick={resendCode}
            className="w-full text-center text-sm text-sand-dim hover:text-gold"
          >
            Resend code
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-sand">Create your account</h1>
      <p className="mt-1 text-sm text-sand-dim">Join GulfPaws in under a minute.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-petrol-light p-1">
        <button
          type="button"
          onClick={() => setRole("OWNER")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "OWNER" ? "bg-gold text-petrol" : "text-sand-dim hover:text-sand"
          }`}
        >
          Pet owner
        </button>
        <button
          type="button"
          onClick={() => setRole("CAREGIVER")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "CAREGIVER" ? "bg-gold text-petrol" : "text-sand-dim hover:text-sand"
          }`}
        >
          Caregiver
        </button>
      </div>

      {referralCode && (
        <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold">
          You were invited to GulfPaws — you&apos;ll both get booking credit after your first
          booking.
        </p>
      )}

      <div className="mt-5">
        <GoogleButton
          callbackUrl={`/onboarding/role?suggested=${role === "OWNER" ? "owner" : "caregiver"}`}
        />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-sand-dim">
        <div className="h-px flex-1 bg-petrol-lighter" />
        or with email
        <div className="h-px flex-1 bg-petrol-lighter" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-sand-dim">8+ characters, one uppercase letter, one number.</p>
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-2">
          <div>
            <Label htmlFor="phoneCode">Code</Label>
            <Select
              id="phoneCode"
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
            >
              {GULF_PHONE_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="501234567"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-sand-dim">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="h-4 w-4 rounded border-petrol-lighter accent-[#e8a94b]"
          />
          Send me booking updates on WhatsApp
        </label>

        <FieldError message={error ?? undefined} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-sand-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gold hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
