import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  block?: boolean;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_14px_30px_rgba(22,66,60,0.22)]",
  secondary: "bg-[var(--surface-strong)] text-[var(--foreground)] border border-[var(--border)]",
  ghost: "bg-transparent text-[var(--primary)]",
  danger: "bg-[var(--danger)] text-white",
};

export function buttonClasses({
  variant = "primary",
  block,
  className,
}: Pick<ButtonProps, "variant" | "block" | "className">) {
  return cn(
    "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50",
    variants[variant],
    block && "w-full",
    className,
  );
}

export function Button({ className, variant = "primary", block, ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, block, className })} {...props} />;
}
