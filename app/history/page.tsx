import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { getRecentTransactions, requireCompletedProfile } from "@/lib/supabase/queries";
import { formatCurrency, fromPence } from "@/lib/utils";

export default async function HistoryPage() {
  const [profile, transactions] = await Promise.all([requireCompletedProfile(), getRecentTransactions(50)]);

  return (
    <AppShell title="Transaction history" subtitle="Incoming and outgoing fake-balance transfers." currentPath="/history">
      <section className="space-y-3">
        {transactions.length === 0 ? (
          <Card>No transfers yet.</Card>
        ) : (
          transactions.map((transaction) => {
            const incoming = transaction.receiver_user_id === profile.id;
            const otherParty = incoming ? transaction.payer_name : transaction.receiver_name;

            return (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{incoming ? `Received from ${otherParty}` : `Sent to ${otherParty}`}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {new Date(transaction.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {transaction.note ? <p className="mt-3 text-sm text-[var(--muted)]">{transaction.note}</p> : null}
                  </div>
                  <p className={incoming ? "font-semibold text-[var(--primary)]" : "font-semibold text-[var(--danger)]"}>
                    {incoming ? "+" : "-"}
                    {formatCurrency(fromPence(transaction.amount_pence))}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </section>
    </AppShell>
  );
}
