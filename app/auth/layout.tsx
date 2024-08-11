import type { Metadata } from "next";
import "../globals.css";
import { Card } from "@/components/shared/shared";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Auth",
  description: "Log in to your Mileston Wallet Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-5T3MLP6W2Z" />
      <body className="bg-[#0A0C13] text-white">
        <main className="h-screen flex items-center justify-center">
          <Card>{children}</Card>
        </main>
      </body>
    </html>
  );
}
