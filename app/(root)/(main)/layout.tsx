import type { Metadata } from "next";
import "../../globals.css";
import { Nav } from "@/components/shared/shared";

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
        <main className="styled-bg h-full min-h-screen text-white py-[4rem] px-[6rem]">
          <Nav /> 
          <div className="mt-[4rem]">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
