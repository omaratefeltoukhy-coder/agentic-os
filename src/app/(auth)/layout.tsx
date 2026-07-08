import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-display text-xl font-bold tracking-tight text-sand">
        GulfPaws<span className="text-gold">.</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
