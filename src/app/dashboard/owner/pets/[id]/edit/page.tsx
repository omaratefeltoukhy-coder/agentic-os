import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PetForm } from "@/components/pets/pet-form";

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet || pet.ownerId !== session.user.id) notFound();

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Edit {pet.name}</h1>
      <div className="mt-6">
        <PetForm
          petId={pet.id}
          initial={{
            name: pet.name,
            type: pet.type,
            breed: pet.breed ?? "",
            age: pet.age?.toString() ?? "",
            temperament: pet.temperament ?? "",
            photoUrl: pet.photoUrl,
            vaccinationCardUrl: pet.vaccinationCardUrl,
          }}
        />
      </div>
    </div>
  );
}
