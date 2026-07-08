import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-petrol-lighter bg-petrol-light/60 p-6 shadow-lg shadow-black/20",
        className
      )}
    >
      {children}
    </div>
  );
}
