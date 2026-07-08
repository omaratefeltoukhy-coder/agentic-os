import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/caregivers", label: "Verification queue" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/promos", label: "Promo codes" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.activeRole !== "ADMIN") redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 sm:flex-row">
        <nav className="flex shrink-0 gap-2 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-sand-dim hover:bg-petrol-light hover:text-sand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
