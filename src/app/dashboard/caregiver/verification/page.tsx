import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { VerificationForm } from "@/components/caregiver/verification-form";

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  UNVERIFIED: { label: "Not submitted", tone: "text-sand-dim" },
  PENDING: { label: "Under review", tone: "text-gold" },
  APPROVED: { label: "Verified ✓", tone: "text-success" },
  REJECTED: { label: "Rejected — please resubmit", tone: "text-danger" },
};

export default async function CaregiverVerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver/profile");

  const status = STATUS_COPY[profile.verificationStatus];

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">ID verification</h1>
      <p className={`mt-1 text-sm font-medium ${status.tone}`}>{status.label}</p>

      <div className="mt-6">
        {profile.verificationStatus === "APPROVED" ? (
          <Card>
            <p className="text-sm text-sand-dim">
              You&apos;re verified! The Verified badge now shows on your public profile.
            </p>
          </Card>
        ) : (
          <VerificationForm existingUrl={profile.idDocumentUrl} />
        )}
      </div>
    </div>
  );
}
