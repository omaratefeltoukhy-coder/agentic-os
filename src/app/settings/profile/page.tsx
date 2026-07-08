import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/settings/profile");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-sand">Profile settings</h1>
        <p className="mt-1 text-sm text-sand-dim">{user.email}</p>
        <div className="mt-6">
          <ProfileForm
            initialName={user.name ?? ""}
            initialPhoneCountryCode={user.phoneCountryCode}
            initialPhoneNumber={user.phoneNumber}
            initialWhatsappOptIn={user.whatsappOptIn}
            initialCity={user.city}
            initialLocale={user.locale}
          />
        </div>
      </main>
    </div>
  );
}
