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
      <GoogleAnalytics gaId="G-5T3MLP6W2Z" />
      <body>
        <main className="bg-[#0A0C13] h-full min-h-screen text-white py-[1rem] px-[1rem] md:py-[2rem] md:px-[3rem] lg:py-[4rem] lg:px-[6rem]">
          <div className="mt-[4rem]">{children}</div>
        </main>
      </body>
    </html>
  );
}
