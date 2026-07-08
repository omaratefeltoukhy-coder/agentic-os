import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CITY_INFO } from "@/lib/constants/gulf";

export default async function BrowsePage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-sand">Find a caregiver</h1>
        <p className="mt-1 text-sand-dim">
          Browsing as a guest — create an account to book a walk or sit.
        </p>

        <Card className="mt-6">
          <p className="text-sm text-sand-dim">
            The full search, filters, and caregiver cards land in the marketplace build step.
            Here&apos;s a preview of the 8 cities GulfPaws serves at launch:
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.values(CITY_INFO).map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-3 text-center"
              >
                <div className="text-sm font-medium text-sand">{c.label}</div>
                <div className="text-xs text-sand-dim">{c.currency}</div>
              </div>
            ))}
          </div>
        </Card>

        {!session?.user && (
          <Card className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-sand">Ready to book?</h2>
              <p className="text-sm text-sand-dim">Create a free account to request a booking.</p>
            </div>
            <LinkButton href="/signup?role=owner">Sign up</LinkButton>
          </Card>
        )}
      </main>
    </div>
  );
}
