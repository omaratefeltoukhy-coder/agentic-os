import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PetForm } from "@/components/pets/pet-form";

export default async function NewPetPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Add a pet</h1>
      <div className="mt-6">
        <PetForm />
      </div>
    </div>
  );
}
