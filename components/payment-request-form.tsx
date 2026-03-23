"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PaymentRequestForm({
  action,
  defaultAmount,
  defaultNote,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;
  defaultAmount?: number | null;
  defaultNote?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Suggested amount</p>
          <Input
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="Optional"
            defaultValue={defaultAmount ? (defaultAmount / 100).toFixed(2) : ""}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Suggested note</p>
          <Input name="note" placeholder="Rent, dinner, taxi..." defaultValue={defaultNote ?? ""} />
        </div>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}
        {state && "success" in state && state.success ? (
          <p className="text-sm text-[var(--primary)]">Request preferences saved.</p>
        ) : null}
        <Button type="submit" block disabled={pending}>
          {pending ? "Saving..." : "Save payment request"}
        </Button>
      </form>
    </Card>
  );
}
