import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";

export default function TapNotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <h1 className="text-2xl font-semibold">Card not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          That tap URL doesn't match an active NFC card. Check the card code or seed the demo cards again.
        </p>
        <Link className={buttonClasses({ block: true, className: "mt-5" })} href="/dashboard">
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
