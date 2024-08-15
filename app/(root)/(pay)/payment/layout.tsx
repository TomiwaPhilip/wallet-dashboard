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
        <main className="text-white">
          <div className="">{children}</div>
        </main>
      </body>
    </html>
  );
}
