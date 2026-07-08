import Link from "next/link";
import { auth } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CITY_INFO } from "@/lib/constants/gulf";

const CITY_LIST = Object.values(CITY_INFO)
  .map((c) => c.label)
  .join(" · ");

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-sand">
          GulfPaws<span className="text-gold">.</span>
        </Link>
        <nav className="flex items-center gap-3">
          {session?.user ? (
            <LinkButton href="/dashboard" size="sm" variant="secondary">
              Dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/browse" size="sm" variant="ghost">
                Browse as guest
              </LinkButton>
              <LinkButton href="/login" size="sm" variant="outline">
                Log in
              </LinkButton>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-24 pt-10 sm:px-10">
        <div className="mb-14 max-w-2xl text-center">
          <p className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-medium tracking-wide text-gold uppercase">
            {CITY_LIST}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-sand sm:text-5xl">
            Pet care you can trust, <span className="text-gold">across the Gulf.</span>
          </h1>
          <p className="mt-4 text-lg text-sand-dim">
            Book vetted dog walkers and cat sitters near you — scheduled around the heat, paid
            in your currency, in Arabic or English.
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <div className="text-3xl">🐾</div>
            <div>
              <h2 className="font-display text-xl font-semibold text-sand">I&apos;m a pet owner</h2>
              <p className="mt-1 text-sm text-sand-dim">
                Find a caregiver, book in 30-minute slots, and pay securely.
              </p>
            </div>
            <LinkButton href="/signup?role=owner" className="mt-auto w-full">
              Get started as an owner
            </LinkButton>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="text-3xl">🐕</div>
            <div>
              <h2 className="font-display text-xl font-semibold text-sand">
                I offer pet care
              </h2>
              <p className="mt-1 text-sm text-sand-dim">
                Set your own rate and free time slots. Get paid, on your terms.
              </p>
            </div>
            <LinkButton
              href="/signup?role=caregiver"
              variant="secondary"
              className="mt-auto w-full"
            >
              Become a caregiver
            </LinkButton>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-sm text-sand-dim">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gold hover:underline">
              Log in
            </Link>
          </p>
          <p>
            Just looking?{" "}
            <Link href="/browse" className="font-medium text-gold hover:underline">
              Browse caregivers as a guest
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
