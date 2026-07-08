import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BecomeCaregiverButton } from "@/components/auth/become-caregiver";

export default async function CaregiverOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding/caregiver");

  const isCaregiver = session.user.roles.includes("CAREGIVER");

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        <Card>
          <div className="text-3xl">🐕</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-sand">
            {isCaregiver ? "You're set up as a caregiver" : "Become a GulfPaws caregiver"}
          </h1>
          <p className="mt-2 text-sm text-sand-dim">
            {isCaregiver
              ? "Your rate & availability wizard lands in the next build step. For now, head to your caregiver dashboard."
              : "Set your own hourly rate, choose the areas you cover, and pick the times you're free. The full rate & availability wizard ships in the next build step — this just reserves your caregiver role."}
          </p>

          {isCaregiver ? (
            <LinkButton href="/dashboard/caregiver" className="mt-5">
              Go to caregiver dashboard
            </LinkButton>
          ) : (
            <BecomeCaregiverButton />
          )}
        </Card>
      </main>
    </div>
  );
}
