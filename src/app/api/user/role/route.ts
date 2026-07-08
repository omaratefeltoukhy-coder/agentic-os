import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  role: z.enum(["OWNER", "CAREGIVER"]),
  // "select" = first-time role choice on /onboarding/role
  // "add" = an existing user picking up the other role (header switcher)
  // "switch" = flip activeRole between roles already held
  mode: z.enum(["select", "add", "switch"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { role, mode } = parsed.data;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  if (mode === "switch" && !user.roles.includes(role)) {
    return NextResponse.json({ error: "You don't hold that role yet." }, { status: 400 });
  }

  const roles = Array.from(new Set([...user.roles, role]));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      roles,
      activeRole: role,
      hasSelectedRole: true,
    },
  });

  return NextResponse.json({ ok: true, roles, activeRole: role });
}
