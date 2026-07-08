import { prisma } from "@/lib/prisma";
import { PromoManager } from "@/components/admin/promo-manager";

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Promo codes</h1>
      <div className="mt-6">
        <PromoManager
          initial={promos.map((p) => ({
            ...p,
            fixedAmountOff: p.fixedAmountOff ? p.fixedAmountOff.toString() : null,
          }))}
        />
      </div>
    </div>
  );
}
