import { prisma } from "@/lib/prisma";
import { DEFAULT_COMMISSION_RATE, PRO_COMMISSION_RATE } from "@/lib/pricing";

export async function getCommissionRates() {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: ["default_commission_rate", "pro_commission_rate"] } },
  });
  const map = new Map(rows.map((r) => [r.key, Number(r.value)]));

  return {
    defaultRate: map.get("default_commission_rate") ?? DEFAULT_COMMISSION_RATE,
    proRate: map.get("pro_commission_rate") ?? PRO_COMMISSION_RATE,
  };
}
