import { NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp } from "@/lib/otp";
import { otpEmailHtml, sendEmail } from "@/lib/notifications/email";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

const schema = z.object({
  email: z.email(),
  purpose: z.enum(["EMAIL_VERIFY", "PASSWORD_RESET"]),
});

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = rateLimit(`resend-otp:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, purpose } = parsed.data;
  const code = await issueOtp(email, purpose);
  await sendEmail({
    to: email,
    subject: purpose === "EMAIL_VERIFY" ? "Verify your GulfPaws email" : "Reset your GulfPaws password",
    html: otpEmailHtml(code, purpose),
  });

  return NextResponse.json({ ok: true });
}
