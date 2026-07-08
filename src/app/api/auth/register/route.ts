import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import { issueOtp } from "@/lib/otp";
import { otpEmailHtml, sendEmail } from "@/lib/notifications/email";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, phoneCountryCode, phoneNumber, whatsappOptIn, role, referralCode } =
    parsed.data;
  const normalizedEmail = email.toLowerCase();

  const referrer = referralCode
    ? await prisma.user.findUnique({ where: { referralCode }, select: { id: true } })
    : null;

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    if (existing.passwordHash && existing.emailVerified) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (existing.passwordHash && !existing.emailVerified) {
      // Re-issue OTP for an unfinished signup instead of erroring out.
      const code = await issueOtp(normalizedEmail, "EMAIL_VERIFY");
      await sendEmail({
        to: normalizedEmail,
        subject: "Verify your GulfPaws email",
        html: otpEmailHtml(code, "EMAIL_VERIFY"),
      });
      return NextResponse.json({ ok: true, pendingVerification: true });
    }
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    create: {
      name,
      email: normalizedEmail,
      passwordHash,
      phoneCountryCode: phoneCountryCode || null,
      phoneNumber: phoneNumber || null,
      whatsappOptIn,
      roles: [role],
      activeRole: role,
      hasSelectedRole: true,
      referredById: referrer?.id ?? null,
    },
    update: {
      name,
      passwordHash,
      phoneCountryCode: phoneCountryCode || null,
      phoneNumber: phoneNumber || null,
      whatsappOptIn,
      roles: [role],
      activeRole: role,
      hasSelectedRole: true,
    },
  });

  const code = await issueOtp(normalizedEmail, "EMAIL_VERIFY");
  await sendEmail({
    to: normalizedEmail,
    subject: "Verify your GulfPaws email",
    html: otpEmailHtml(code, "EMAIL_VERIFY"),
  });

  return NextResponse.json({ ok: true, pendingVerification: true });
}
