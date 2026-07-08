"use client";

import { useRouter } from "next/navigation";
import { AvailabilityGrid } from "@/components/caregiver/availability-grid";
import { Card } from "@/components/ui/card";

export function WizardAvailabilityClient({
  initialSlots,
  weekendDays,
}: {
  initialSlots: { dayOfWeek: number; startMinute: number }[];
  weekendDays: number[];
}) {
  const router = useRouter();

  return (
    <Card>
      <AvailabilityGrid
        initialSlots={initialSlots}
        weekendDays={weekendDays}
        onSaved={() => router.push("/dashboard/caregiver")}
      />
    </Card>
  );
}
