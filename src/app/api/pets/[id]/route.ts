import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations/pet";

async function requireOwnedPet(userId: string, petId: string) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.ownerId !== userId) return null;
  return pet;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const pet = await requireOwnedPet(session.user.id, id);
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.pet.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      breed: parsed.data.breed || null,
      age: parsed.data.age ?? null,
      temperament: parsed.data.temperament || null,
      photoUrl: parsed.data.photoUrl || null,
      vaccinationCardUrl: parsed.data.vaccinationCardUrl || null,
    },
  });

  return NextResponse.json({ pet: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const pet = await requireOwnedPet(session.user.id, id);
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

  await prisma.pet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
