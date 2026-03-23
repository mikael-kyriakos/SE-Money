import Link from "next/link";
import { ArrowRightLeft, ExternalLink, ScanLine, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import {
  getCurrentCard,
  getCurrentPaymentRequest,
  getRecentTransactions,
  requireCompletedProfile,
} from "@/lib/supabase/queries";
import { buildAppUrl, formatCurrency, fromPence } from "@/lib/utils";

export default async function DashboardPage() {
  const [profile, card, request, transactions] = await Promise.all([
    requireCompletedProfile(),
    getCurrentCard(),
    getCurrentPaymentRequest(),
    getRecentTransactions(6),
  ]);

  const cardUrl = card ? buildAppUrl(`/tap/${card.card_code}`) : null;

  return (
    <AppShell title={`Hi, ${profile.display_name}`} subtitle="Fast private payments for your house group." currentPath="/dashboard">
      <section className="space-y-4">
        <Card className="bg-[var(--primary)] text-[var(--primary-foreground)]">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Available balance</p>
          <p className="mt-3 text-4xl font-semibold">{formatCurrency(fromPence(profile.balance_pence))}</p>
          <div className="mt-5 flex items-center justify-between text-sm text-white/80">
            <span>{profile.email}</span>
            <LogoutButton />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Card code</p>
            <p className="mt-2 font-semibold">{card?.card_code ?? "Unassigned"}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Saved request</p>
            <p className="mt-2 font-semibold">
              {request?.amount_pence ? formatCurrency(fromPence(request.amount_pence)) : "Any amount"}
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Your NFC link</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Program this URL onto your card so your friends' phones open your payment page when tapped.
              </p>
            </div>
            <ScanLine className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="mt-4 rounded-2xl bg-[var(--surface-strong)] p-3 text-xs break-all text-[var(--muted)]">
            {cardUrl ?? "Assign a demo card in the seed script."}
          </div>
          <div className="mt-4 flex gap-3">
            <Link className={buttonClasses({ variant: "secondary", block: true, className: "flex-1" })} href="/request">
              Request payment
            </Link>
            {cardUrl ? (
              <a className={buttonClasses({ block: true, className: "flex-1" })} href={cardUrl}>
                Test tap URL
              </a>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Recent activity</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Your latest incoming and outgoing transfers.</p>
            </div>
            <Link href="/history" className="text-sm font-semibold text-[var(--primary)]">
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl bg-[var(--surface-strong)] px-4 py-5 text-sm text-[var(--muted)]">
                No transactions yet.
              </div>
            ) : (
              transactions.map((transaction) => {
                const incoming = transaction.receiver_user_id === profile.id;
                const otherParty = incoming ? transaction.payer_name : transaction.receiver_name;

                return (
                  <div key={transaction.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-strong)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-2">
                        <ArrowRightLeft className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{incoming ? `From ${otherParty}` : `To ${otherParty}`}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(transaction.created_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={incoming ? "font-semibold text-[var(--primary)]" : "font-semibold text-[var(--danger)]"}>
                      {incoming ? "+" : "-"}
                      {formatCurrency(fromPence(transaction.amount_pence))}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="bg-[linear-gradient(135deg,#f9ead1,#fffdf8)]">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-semibold">Future group ledger mode</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                The scaffold for shared expense splits and settlement suggestions is already in the app.
              </p>
              <Link href="/ledger-lab" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                Open ledger lab
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
