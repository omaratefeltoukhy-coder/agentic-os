import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "md" | "lg" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gold text-petrol font-semibold hover:bg-gold-light active:bg-gold disabled:opacity-50",
  secondary:
    "bg-petrol-lighter text-sand font-semibold hover:bg-petrol-light border border-petrol-lighter",
  outline: "bg-transparent text-sand border border-sand-dim/40 hover:border-gold hover:text-gold",
  ghost: "bg-transparent text-sand-dim hover:text-sand",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-3 text-sm rounded-xl",
  lg: "px-6 py-4 text-base rounded-xl",
};

const base =
  "inline-flex items-center justify-center gap-2 transition-colors duration-150 disabled:cursor-not-allowed cursor-pointer";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </Link>
  );
}
