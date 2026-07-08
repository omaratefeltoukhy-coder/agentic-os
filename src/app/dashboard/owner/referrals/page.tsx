import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ReferralShare } from "@/components/referrals/referral-share";
import { getReferralBalance } from "@/lib/referral-balance";
import { formatMoney, type CurrencyCode } from "@/lib/constants/gulf";

export default async function OwnerReferralsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const referralsCount = await prisma.user.count({ where: { referredById: user.id } });
  const balance = await getReferralBalance(user.id);

  const link = `https://gulfpaws.app/signup?ref=${user.referralCode}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `I've been using GulfPaws to book trusted dog walkers & cat sitters — sign up with my link and we both get booking credit! ${link}`
  )}`;

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Refer &amp; earn</h1>
      <p className="mt-1 text-sm text-sand-dim">
        {referralsCount} friend{referralsCount === 1 ? "" : "s"} joined with your link.
      </p>

      <div className="mt-6">
        <ReferralShare link={link} whatsappLink={whatsappLink} />
      </div>

      <Card className="mt-4">
        <h2 className="font-display text-sm font-semibold text-sand">Your credit balance</h2>
        {balance.size === 0 ? (
          <p className="mt-1 text-sm text-sand-dim">No credit yet.</p>
        ) : (
          <div className="mt-2 space-y-1">
            {Array.from(balance.entries()).map(([currency, amount]) => (
              <p key={currency} className="text-lg font-semibold text-gold">
                {formatMoney(amount, currency as CurrencyCode)}
              </p>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-sand-dim">
          Credit is applied automatically at checkout on your next booking.
        </p>
      </Card>
    </div>
  );
}
