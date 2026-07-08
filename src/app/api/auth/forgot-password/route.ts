import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { issueOtp } from "@/lib/otp";
import { otpEmailHtml, sendEmail } from "@/lib/notifications/email";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`forgot-password:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond ok — don't leak whether an email is registered.
  if (user?.passwordHash) {
    const code = await issueOtp(email, "PASSWORD_RESET");
    await sendEmail({
      to: email,
      subject: "Reset your GulfPaws password",
      html: otpEmailHtml(code, "PASSWORD_RESET"),
    });
  }

  return NextResponse.json({ ok: true });
}
