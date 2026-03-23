import { AuthForm } from "@/components/auth-form";
import { signupAction } from "@/lib/actions/auth-actions";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10">
      <div>
        <p className="inline-flex rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          Friend group setup
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          After signup, each person sets a display name and a 4-digit payment PIN.
        </p>
      </div>

      <AuthForm mode="signup" action={signupAction} />
    </main>
  );
}
