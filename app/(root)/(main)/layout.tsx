import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';

import "../../globals.css";
import { MobileNav, Nav } from "@/components/shared/shared";

export const metadata: Metadata = {
  title: "Mileston Wallet Dashboard",
  description: "Receive, Send and Manage your assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="styled-bg h-full min-h-screen text-white py-[1rem] px-[1rem] md:py-[2rem] md:px-[3rem] lg:py-[4rem] lg:px-[6rem]">
          <div className="hidden sm:block">
            <Nav /> 
          </div>
          <MobileNav />
          <div className="mt-[2rem] md:mt-[3rem] lg:mt-[4rem]">
            {children}
          </div>
        </main>
        <GoogleAnalytics gaId="G-4L4BM0EEW7" />
      </body>
    </html>
  );
}
