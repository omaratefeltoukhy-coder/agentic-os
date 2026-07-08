import Link from "next/link";
import { auth } from "@/lib/auth";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { LinkButton } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b border-petrol-lighter px-6 py-4 sm:px-10">
      <Link href="/" className="font-display text-xl font-bold tracking-tight text-sand">
        GulfPaws<span className="text-gold">.</span>
      </Link>

      <div className="flex items-center gap-3">
        {session?.user ? (
          <>
            {session.user.roles.length > 1 && (
              <RoleSwitcher roles={session.user.roles} activeRole={session.user.activeRole} />
            )}
            <UserMenu name={session.user.name ?? session.user.email ?? "Account"} />
          </>
        ) : (
          <>
            <LinkButton href="/browse" size="sm" variant="ghost">
              Browse
            </LinkButton>
            <LinkButton href="/login" size="sm" variant="outline">
              Log in
            </LinkButton>
          </>
        )}
      </div>
    </header>
  );
}
