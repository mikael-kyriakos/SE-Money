import Link from "next/link";
import { PropsWithChildren } from "react";
import { CreditCard, History, House, ReceiptText, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/history", label: "History", icon: History },
  { href: "/request", label: "Request", icon: Wallet },
  { href: "/ledger-lab", label: "Ledger", icon: ReceiptText },
];

export function AppShell({
  title,
  subtitle,
  currentPath,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string; currentPath: string }>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          <CreditCard className="h-3.5 w-3.5" />
          Friend Pay
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </header>

      <div className="flex-1">{children}</div>

      <nav className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 gap-2 rounded-[28px] border border-[var(--border)] bg-[rgba(255,253,248,0.94)] p-2 backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] font-medium",
                active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted)]",
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
