import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AvailabilityGrid } from "@/components/caregiver/availability-grid";
import { AvailabilityOverrides } from "@/components/caregiver/availability-overrides";
import { WEEKEND_DAYS } from "@/lib/constants/gulf";

export default async function CaregiverEditAvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    include: { availabilitySlots: true, availabilityOverrides: true },
  });
  if (!profile) redirect("/onboarding/caregiver/profile");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-sand">Edit availability</h1>
        <p className="mt-1 text-sm text-sand-dim">Changes apply to future bookings only.</p>
      </div>

      <Card>
        <AvailabilityGrid
          initialSlots={profile.availabilitySlots.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startMinute: s.startMinute,
          }))}
          weekendDays={WEEKEND_DAYS[profile.city]}
        />
      </Card>

      <AvailabilityOverrides
        initial={profile.availabilityOverrides.map((o) => ({
          date: o.date.toISOString().slice(0, 10),
          isDayOff: o.isDayOff,
        }))}
      />
    </div>
  );
}
