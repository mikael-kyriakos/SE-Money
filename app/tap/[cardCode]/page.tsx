import { notFound } from "next/navigation";
import { PaymentTerminal } from "@/components/payment-terminal";
import { executeTapPaymentAction } from "@/lib/actions/payment-actions";
import { getPaymentRequestForUser, getTapContext } from "@/lib/supabase/queries";

export default async function TapPage({
  params,
}: {
  params: Promise<{ cardCode: string }>;
}) {
  const { cardCode } = await params;
  const tap = await getTapContext(cardCode);

  if (tap.notFound) {
    notFound();
  }

  const request = await getPaymentRequestForUser(tap.payer.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8">
      <div className="mb-6">
        <p className="inline-flex rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          NFC tap detected
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Accept payment</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          This phone is the receiver. The tapped card owner is the payer and must enter their PIN to approve.
        </p>
      </div>

      <PaymentTerminal
        action={executeTapPaymentAction}
        cardCode={cardCode}
        payerName={tap.payer.displayName}
        receiverName={tap.receiver.display_name ?? tap.receiver.email}
        initialAmount={request?.amount_pence ?? null}
        initialNote={request?.note ?? null}
        selfPayBlocked={tap.payer.id === tap.receiver.id}
      />
    </main>
  );
}
