import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    totalCaregivers,
    totalOwners,
    totalBookings,
    completedBookings,
    pendingVerification,
    gmvAgg,
    commissionAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.caregiverProfile.count(),
    prisma.user.count({ where: { roles: { has: "OWNER" } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ["COMPLETED", "REVIEWED"] } } }),
    prisma.caregiverProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.booking.aggregate({
      where: { status: { in: ["COMPLETED", "REVIEWED"] } },
      _sum: { total: true },
    }),
    prisma.booking.aggregate({
      where: { status: { in: ["COMPLETED", "REVIEWED"] } },
      _sum: { commissionAmount: true },
    }),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers },
    { label: "Caregivers", value: totalCaregivers },
    { label: "Owners", value: totalOwners },
    { label: "Total bookings", value: totalBookings },
    { label: "Completed bookings", value: completedBookings },
    { label: "Pending verification", value: pendingVerification },
    { label: "GMV (all currencies, face value)", value: Number(gmvAgg._sum.total ?? 0).toFixed(2) },
    { label: "Commission revenue", value: Number(commissionAgg._sum.commissionAmount ?? 0).toFixed(2) },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Admin overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="text-xs text-sand-dim">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-sand">{s.value}</div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-sand-dim">
        GMV/commission figures sum across currencies at face value for a quick pulse check —
        production reporting should convert to a single currency.
      </p>
    </div>
  );
}
