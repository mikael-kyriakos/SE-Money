import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[var(--primary)]",
        className,
      )}
      {...props}
    />
  );
});
