import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default async function CaregiverDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-sand">
        Welcome, {session.user.name?.split(" ")[0] ?? "there"} 🐕
      </h1>
      <p className="mt-1 text-sand-dim">Your caregiver dashboard.</p>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand">
          Finish setting up your profile
        </h2>
        <p className="mt-1 text-sm text-sand-dim">
          Add your rate, service areas, and free time slots so owners can find and book you.
        </p>
        <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
          The rate &amp; availability onboarding wizard ships in the next build step.
        </p>
        <LinkButton href="/onboarding/caregiver" variant="secondary" className="mt-4">
          Continue onboarding
        </LinkButton>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-sand-dim">Booking requests</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Earnings this month</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0 AED</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Rating</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">—</div>
        </Card>
      </div>
    </div>
  );
}
