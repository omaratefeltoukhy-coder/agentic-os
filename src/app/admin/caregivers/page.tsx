import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { VerifyButtons } from "@/components/admin/verify-buttons";
import { CITY_INFO } from "@/lib/constants/gulf";

export default async function AdminCaregiversPage() {
  const profiles = await prisma.caregiverProfile.findMany({
    where: { verificationStatus: { in: ["PENDING", "UNVERIFIED"] } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Verification queue</h1>
      <p className="mt-1 text-sm text-sand-dim">
        {profiles.length} caregiver{profiles.length === 1 ? "" : "s"} awaiting review.
      </p>

      <div className="mt-6 space-y-3">
        {profiles.length === 0 && (
          <Card>
            <p className="text-sm text-sand-dim">Nothing to review right now.</p>
          </Card>
        )}
        {profiles.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-sand">{p.user.name}</div>
              <div className="text-sm text-sand-dim">
                {p.user.email} · {CITY_INFO[p.city].label}
              </div>
              <div className="mt-1 text-xs text-sand-dim">
                {p.idDocumentUrl ? (
                  <a href={p.idDocumentUrl} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                    View ID document
                  </a>
                ) : (
                  "No ID document uploaded yet"
                )}
              </div>
            </div>
            <VerifyButtons caregiverProfileId={p.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}
