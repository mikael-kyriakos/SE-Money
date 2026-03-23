import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { computeNetPositions, generateSettlementSuggestions } from "@/lib/ledger";
import { formatCurrency, fromPence } from "@/lib/utils";

const demoParticipants = [
  { userId: "u1", displayName: "Alex" },
  { userId: "u2", displayName: "Sam" },
  { userId: "u3", displayName: "Priya" },
  { userId: "u4", displayName: "Ben" },
];

const demoExpenses = [
  {
    id: "e1",
    description: "Groceries",
    payerUserId: "u1",
    totalAmountPence: 7200,
    shares: [
      { userId: "u1", amountPence: 1800 },
      { userId: "u2", amountPence: 1800 },
      { userId: "u3", amountPence: 1800 },
      { userId: "u4", amountPence: 1800 },
    ],
  },
  {
    id: "e2",
    description: "Cinema",
    payerUserId: "u3",
    totalAmountPence: 4800,
    shares: [
      { userId: "u1", amountPence: 1200 },
      { userId: "u2", amountPence: 1200 },
      { userId: "u3", amountPence: 1200 },
      { userId: "u4", amountPence: 1200 },
    ],
  },
];

export default function LedgerLabPage() {
  const positions = computeNetPositions(demoParticipants, demoExpenses);
  const settlements = generateSettlementSuggestions(positions);

  return (
    <AppShell title="Ledger lab" subtitle="A light scaffold for future shared-expense settlement mode." currentPath="/ledger-lab">
      <section className="space-y-4">
        <Card>
          <p className="text-sm font-semibold">What’s included</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>Equal or custom split calculation helpers.</li>
            <li>Net-position computation per user.</li>
            <li>Minimal settlement suggestions to reduce transfer count.</li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Demo net positions</p>
          <div className="mt-4 space-y-3">
            {positions.map((position) => (
              <div key={position.userId} className="flex items-center justify-between rounded-2xl bg-[var(--surface-strong)] px-4 py-3">
                <span>{position.displayName}</span>
                <span className={position.netPence >= 0 ? "font-semibold text-[var(--primary)]" : "font-semibold text-[var(--danger)]"}>
                  {position.netPence >= 0 ? "+" : "-"}
                  {formatCurrency(fromPence(Math.abs(position.netPence)))}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Settlement suggestions</p>
          <div className="mt-4 space-y-3">
            {settlements.map((settlement, index) => (
              <div key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`} className="rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-sm">
                {settlement.fromDisplayName} pays {settlement.toDisplayName}{" "}
                <span className="font-semibold">{formatCurrency(fromPence(settlement.amountPence))}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
