import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  walletAddress?: string;
  solanaAddress?: string;
  walletBalance?: string;
  isOnboarded?: boolean;
  isVerified?: boolean;
  callbackUrl?: string | null;
  isSecretCopied?: boolean;
  hasJoinedWaitlist?: boolean;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  callbackUrl: null,
  isSecretCopied: false,
  hasJoinedWaitlist: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "mileston-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};
