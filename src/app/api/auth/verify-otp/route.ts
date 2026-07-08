import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`verify-otp:${ip}`, 15, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const { email, code } = parsed.data;
  const ok = await verifyOtp(email, code, "EMAIL_VERIFY");
  if (!ok) {
    return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { emailVerified: new Date() },
  });

  return NextResponse.json({ ok: true });
}
