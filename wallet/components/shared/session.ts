"use client";

import React, { ReactNode, useState, useEffect } from "react";

import { SessionData } from "@/lib/iron-session/session";
import { getSession2 } from "@/lib/actions/server-hooks/getsession.action";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const sessionData = await getSession2();
        setSession(sessionData);
      } catch (error) {
        console.error("Error getting session:", error);
      }
    }

    fetchSession();
  }, []);

  return session;
}
