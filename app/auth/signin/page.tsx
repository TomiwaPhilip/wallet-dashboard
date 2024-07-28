"use client";

import SignInPage from "@/components/pages/SignIn";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <SignInPage />
    </Suspense>
  );
}
