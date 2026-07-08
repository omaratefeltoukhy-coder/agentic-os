"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  photoUrl: string | null;
};

export function PetList({ pets }: { pets: Pet[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Remove this pet profile?")) return;
    await fetch(`/api/pets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (pets.length === 0) {
    return (
      <Card className="text-center">
        <div className="text-3xl">🐾</div>
        <p className="mt-2 text-sand-dim">No pets yet. Add one to start booking.</p>
        <LinkButton href="/dashboard/owner/pets/new" className="mt-4">
          Add a pet
        </LinkButton>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pets.map((pet) => (
        <Card key={pet.id} className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-petrol-light">
            {pet.photoUrl && (
              <Image src={pet.photoUrl} alt={pet.name} width={56} height={56} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-display font-semibold text-sand">
              {pet.name} {pet.type === "DOG" ? "🐕" : "🐈"}
            </div>
            <div className="text-sm text-sand-dim">
              {[pet.breed, pet.age ? `${pet.age} yrs` : null].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
          <Link
            href={`/dashboard/owner/pets/${pet.id}/edit`}
            className="text-sm text-gold hover:underline"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(pet.id)}
            className="text-sm text-danger hover:underline"
          >
            Delete
          </button>
        </Card>
      ))}
      <LinkButton href="/dashboard/owner/pets/new" variant="secondary">
        Add another pet
      </LinkButton>
    </div>
  );
}
