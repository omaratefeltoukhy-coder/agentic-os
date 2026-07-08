import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(email: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET") {
  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      email: email.toLowerCase(),
      code,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return code;
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: "EMAIL_VERIFY" | "PASSWORD_RESET"
) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email: email.toLowerCase(),
      code,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return true;
}
