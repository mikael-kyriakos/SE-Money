"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (prevState: unknown, formData: FormData) => Promise<{ error?: string } | void>;
  next?: string;
};

export function AuthForm({ mode, action, next }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card className="mt-8">
      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <p className="mb-2 text-sm font-medium">Email</p>
          <Input name="email" type="email" placeholder="alex@example.com" required />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Password</p>
          <Input name="password" type="password" placeholder="At least 8 characters" required />
        </div>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-[var(--danger)]">{state.error}</p>
        ) : null}
        <Button type="submit" block disabled={pending}>
          {pending ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "login" ? "Need an account? " : "Already have an account? "}
        <Link className="font-semibold text-[var(--primary)]" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </Card>
  );
}
