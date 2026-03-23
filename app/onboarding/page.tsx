import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { completeOnboardingAction } from "@/lib/actions/profile-actions";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-10">
      <div className="mb-6">
        <p className="inline-flex rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          One-time setup
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Finish your profile</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Pick the name your friends will see and create the PIN you’ll type to approve payments.
        </p>
      </div>

      <OnboardingForm action={completeOnboardingAction} defaultDisplayName={profile.display_name} />
    </main>
  );
}
