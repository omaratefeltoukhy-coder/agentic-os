import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PetList } from "@/components/pets/pet-list";

export default async function OwnerPetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-sand">My pets</h1>
      <p className="mt-1 text-sm text-sand-dim">Add a pet profile before booking a caregiver.</p>
      <div className="mt-6">
        <PetList pets={pets} />
      </div>
    </div>
  );
}
