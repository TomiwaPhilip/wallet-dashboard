"use client";

import { NoOutlineButtonBig } from "@/components/shared/buttons";
import { signOut } from "@/lib/actions/login.action";

export default function HomePage() {
  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <>
      <p>This is home!</p>
      <NoOutlineButtonBig
        name="Log out"
        type="button"
        onclick={handleSignOut}
      />
    </>
  );
}
