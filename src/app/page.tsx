import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CITY_INFO } from "@/lib/constants/gulf";
import { getDictionary } from "@/i18n/dictionary";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const CITY_LIST = Object.values(CITY_INFO)
  .map((c) => c.label)
  .join(" · ");

export default async function Home() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const locale = session?.user?.locale ?? cookieStore.get("gp_locale")?.value ?? "en";
  const t = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-sand">
          GulfPaws<span className="text-gold">.</span>
        </Link>
        <nav className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          {session?.user ? (
            <LinkButton href="/dashboard" size="sm" variant="secondary">
              {t.nav.dashboard}
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/browse" size="sm" variant="ghost">
                {t.nav.browse}
              </LinkButton>
              <LinkButton href="/login" size="sm" variant="outline">
                {t.nav.login}
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
            {t.landing.tagline}
          </h1>
          <p className="mt-4 text-lg text-sand-dim">{t.landing.subtitle}</p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <div className="text-3xl">🐾</div>
            <div>
              <h2 className="font-display text-xl font-semibold text-sand">
                {t.landing.ownerCardTitle}
              </h2>
              <p className="mt-1 text-sm text-sand-dim">{t.landing.ownerCardBody}</p>
            </div>
            <LinkButton href="/signup?role=owner" className="mt-auto w-full">
              {t.landing.ownerCardCta}
            </LinkButton>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="text-3xl">🐕</div>
            <div>
              <h2 className="font-display text-xl font-semibold text-sand">
                {t.landing.caregiverCardTitle}
              </h2>
              <p className="mt-1 text-sm text-sand-dim">{t.landing.caregiverCardBody}</p>
            </div>
            <LinkButton
              href="/signup?role=caregiver"
              variant="secondary"
              className="mt-auto w-full"
            >
              {t.landing.caregiverCardCta}
            </LinkButton>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-sm text-sand-dim">
          <p>
            {t.landing.alreadyHaveAccount}{" "}
            <Link href="/login" className="font-medium text-gold hover:underline">
              {t.common.logIn}
            </Link>
          </p>
          <p>
            {t.landing.justLooking}{" "}
            <Link href="/browse" className="font-medium text-gold hover:underline">
              {t.landing.browseAsGuest}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
