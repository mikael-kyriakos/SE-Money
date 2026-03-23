import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/actions/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10">
      <div>
        <p className="inline-flex rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          Private house payments
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Sign in on the receiver’s phone before someone taps their NFC card.
        </p>
      </div>

      <AuthForm mode="login" action={loginAction} next={params.next} />
    </main>
  );
}
