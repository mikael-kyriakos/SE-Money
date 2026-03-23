"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, CircleAlert, PoundSterling, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type TerminalProps = {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;
  cardCode: string;
  payerName: string;
  receiverName: string;
  initialAmount?: number | null;
  initialNote?: string | null;
  selfPayBlocked?: boolean;
};

export function PaymentTerminal({
  action,
  cardCode,
  payerName,
  receiverName,
  initialAmount,
  initialNote,
  selfPayBlocked,
}: TerminalProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [amount, setAmount] = useState(initialAmount ? (initialAmount / 100).toFixed(2) : "");

  if (selfPayBlocked) {
    return (
      <Card className="border-[var(--danger)]">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 text-[var(--danger)]" />
          <div>
            <h2 className="font-semibold">You can’t pay yourself</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              This card belongs to your account. Tap someone else’s card to collect a payment.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (state && "success" in state && state.success) {
    const successAmount = Number(amount || "0");

    return (
      <Card className="border-[var(--primary)] bg-[var(--surface-strong)]">
        <CheckCircle2 className="h-10 w-10 text-[var(--primary)]" />
        <h2 className="mt-4 text-2xl font-semibold">Payment approved</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {payerName} sent {formatCurrency(successAmount)} to {receiverName}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-[var(--primary)] px-5 py-4 text-[var(--primary-foreground)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/70">Tap terminal</p>
            <h2 className="mt-1 text-xl font-semibold">Confirm incoming payment</h2>
          </div>
          <Smartphone className="h-8 w-8 text-white/80" />
        </div>
      </div>

      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="cardCode" value={cardCode} />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--surface-strong)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Payer</p>
            <p className="mt-1 font-semibold">{payerName}</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-strong)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Receiver</p>
            <p className="mt-1 font-semibold">{receiverName}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Amount</p>
          <div className="relative">
            <PoundSterling className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="pl-10 text-lg font-semibold"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Note (optional)</p>
          <Input name="note" placeholder="Coffee, rent, groceries..." defaultValue={initialNote ?? ""} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Payer PIN</p>
          <Input
            name="pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder="Enter 4 digits"
            className="text-center text-2xl tracking-[0.5em]"
            required
          />
        </div>

        {state && "error" in state && state.error ? (
          <p className="rounded-2xl bg-[rgba(166,44,43,0.08)] px-4 py-3 text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}

        <Button type="submit" block disabled={pending}>
          {pending ? "Authorising..." : "Charge card owner"}
        </Button>
      </form>
    </Card>
  );
}
