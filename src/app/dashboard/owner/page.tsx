import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("OWNER")) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-sand">
        Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
      </h1>
      <p className="mt-1 text-sand-dim">Here&apos;s your GulfPaws overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-sand-dim">Upcoming bookings</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">My pets</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Referral credit</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0 AED</div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand">Find a caregiver</h2>
        <p className="mt-1 text-sm text-sand-dim">
          Search, filter, and book dog walkers or cat sitters near you.
        </p>
        <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold">
          The marketplace search &amp; booking engine ships in the next build step.
        </p>
        <LinkButton href="/browse" variant="secondary" className="mt-4">
          Preview browse page
        </LinkButton>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand">Want to earn too?</h2>
        <p className="mt-1 text-sm text-sand-dim">
          Offer dog walking or cat sitting and set your own rate.
        </p>
        <LinkButton href="/onboarding/caregiver" variant="outline" className="mt-4">
          Become a caregiver
        </LinkButton>
      </Card>
    </div>
  );
}
