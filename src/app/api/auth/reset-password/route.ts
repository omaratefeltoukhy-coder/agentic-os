import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { verifyOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`reset-password:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, code, password } = parsed.data;
  const ok = await verifyOtp(email, code, "PASSWORD_RESET");
  if (!ok) {
    return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
