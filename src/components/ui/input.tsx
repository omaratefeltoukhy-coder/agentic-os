import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-petrol-light border border-petrol-lighter px-4 py-3 text-sand placeholder:text-sand-dim/60 outline-none transition-colors focus:border-gold",
          className
        )}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-petrol-light border border-petrol-lighter px-4 py-3 text-sand outline-none transition-colors focus:border-gold",
          className
        )}
        {...props}
      />
    );
  }
);

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-sand-dim">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-danger">{message}</p>;
}
