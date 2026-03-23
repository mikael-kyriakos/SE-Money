"use client";

import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" type="submit" className="px-0 text-sm">
        Sign out
      </Button>
    </form>
  );
}
