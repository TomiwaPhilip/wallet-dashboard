import type { Metadata } from "next";
import "../../../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Mileston Pay",
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
        <main className="bg-[#0A0C13] h-full min-h-screen text-white py-[4rem] px-[6rem]">
          <div className="mt-[4rem]">{children}</div>
        </main>
        <GoogleAnalytics gaId="G-5T3MLP6W2Z" />
      </body>
    </html>
  );
}
