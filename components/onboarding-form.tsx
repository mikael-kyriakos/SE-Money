"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function OnboardingForm({
  action,
  defaultDisplayName,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | void>;
  defaultDisplayName?: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Display name</p>
          <Input name="displayName" defaultValue={defaultDisplayName ?? ""} placeholder="Alex" required />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">4-digit PIN</p>
          <Input
            name="pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder="1234"
            required
          />
        </div>
        <p className="rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
          Your PIN is used only to approve payments when your NFC card is tapped.
        </p>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}
        <Button type="submit" block disabled={pending}>
          {pending ? "Saving..." : "Finish setup"}
        </Button>
      </form>
    </Card>
  );
}
