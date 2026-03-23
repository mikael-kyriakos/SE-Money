import { AppShell } from "@/components/app-shell";
import { PaymentRequestForm } from "@/components/payment-request-form";
import { Card } from "@/components/ui/card";
import { savePaymentRequestAction } from "@/lib/actions/payment-actions";
import { getCurrentCard, getCurrentPaymentRequest, requireCompletedProfile } from "@/lib/supabase/queries";
import { buildAppUrl } from "@/lib/utils";

export default async function RequestPage() {
  const [profile, card, request] = await Promise.all([
    requireCompletedProfile(),
    getCurrentCard(),
    getCurrentPaymentRequest(),
  ]);

  const cardUrl = card ? buildAppUrl(`/tap/${card.card_code}`) : null;

  return (
    <AppShell title="Request payment" subtitle="Pre-fill the amount before someone taps your card." currentPath="/request">
      <section className="space-y-4">
        <PaymentRequestForm action={savePaymentRequestAction} defaultAmount={request?.amount_pence} defaultNote={request?.note} />
        <Card>
          <p className="text-sm font-semibold">How it works</p>
          <ol className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>1. Save an optional amount or note for {profile.display_name}.</li>
            <li>2. Ask your friend to tap your NFC card on their logged-in phone.</li>
            <li>3. The tap page uses your saved request as a starting point.</li>
          </ol>
        </Card>
        {cardUrl ? (
          <Card>
            <p className="text-sm font-semibold">Tap URL for your card</p>
            <p className="mt-3 break-all rounded-2xl bg-[var(--surface-strong)] px-3 py-3 text-xs text-[var(--muted)]">{cardUrl}</p>
          </Card>
        ) : null}
      </section>
    </AppShell>
  );
}
