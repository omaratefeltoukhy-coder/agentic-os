"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";

type Props = {
  petId?: string;
  initial?: {
    name: string;
    type: "DOG" | "CAT";
    breed: string;
    age: string;
    temperament: string;
    photoUrl: string | null;
    vaccinationCardUrl: string | null;
  };
};

const DEFAULTS = {
  name: "",
  type: "DOG" as const,
  breed: "",
  age: "",
  temperament: "",
  photoUrl: null,
  vaccinationCardUrl: null,
};

export function PetForm({ petId, initial = DEFAULTS }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<"DOG" | "CAT">(initial.type);
  const [breed, setBreed] = useState(initial.breed);
  const [age, setAge] = useState(initial.age);
  const [temperament, setTemperament] = useState(initial.temperament);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);
  const [vaccinationCardUrl, setVaccinationCardUrl] = useState<string | null>(
    initial.vaccinationCardUrl
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(petId ? `/api/pets/${petId}` : "/api/pets", {
        method: petId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          breed,
          age: age ? Number(age) : undefined,
          temperament,
          photoUrl,
          vaccinationCardUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save pet.");
        return;
      }
      router.push("/dashboard/owner/pets");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Photo</Label>
          <FileUpload value={photoUrl} onChange={setPhotoUrl} label="photo" />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" value={type} onChange={(e) => setType(e.target.value as "DOG" | "CAT")}>
            <option value="DOG">Dog</option>
            <option value="CAT">Cat</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="age">Age (years)</Label>
          <Input id="age" type="number" min={0} max={40} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="temperament">Temperament notes</Label>
          <textarea
            id="temperament"
            value={temperament}
            onChange={(e) => setTemperament(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-petrol-light border border-petrol-lighter px-4 py-3 text-sand placeholder:text-sand-dim/60 outline-none transition-colors focus:border-gold"
            placeholder="Friendly with other dogs, nervous around loud noises…"
          />
        </div>
        <div>
          <Label>Vaccination card</Label>
          <FileUpload
            value={vaccinationCardUrl}
            onChange={setVaccinationCardUrl}
            label="vaccination card"
            accept="image/jpeg,image/png,application/pdf"
            preview={false}
          />
        </div>

        <FieldError message={error ?? undefined} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : petId ? "Save changes" : "Add pet"}
        </Button>
      </form>
    </Card>
  );
}
