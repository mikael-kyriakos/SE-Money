import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_45px_rgba(84,62,26,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
