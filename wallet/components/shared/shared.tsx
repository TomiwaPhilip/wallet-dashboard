"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center items-center">
      <nav className="bg-[#0E1018] p-4 rounded-full border border-[#131621]">
        <ul className="flex items-center gap-10">
          <li
            className={`gradient-border rounded-full ${pathname === "/" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/"
              className={
                "flex items-center gap-2 bg-[#0E1018] rounded-full p-2"
              }
            >
              <Image
                src="/assets/icons/add_home.svg"
                alt="home_icon"
                height={25}
                width={25}
              />
              Home
            </Link>
          </li>
          <li
            className={`gradient-border rounded-full ${pathname === "/payments" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/payments"
              className={
                "flex items-center gap-2 bg-[#0E1018] p-2 rounded-full"
              }
            >
              <Image
                src="/assets/icons/monetization_on.svg"
                alt="payments_icon"
                height={25}
                width={25}
              />
              Payments
            </Link>
          </li>
          <li
            className={`gradient-border rounded-full ${pathname === "/settings" ? "normal-gradient-border" : ""}`}
          >
            <Link
              href="/settings"
              className={
                "flex items-center gap-2 bg-[#0E1018] rounded-full p-2"
              }
            >
              <Image
                src="/assets/icons/admin_panel_settings.svg"
                alt="settings_icon"
                height={25}
                width={25}
              />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps): JSX.Element {
  return (
    <div className="cards-bg border-2 border-[#23283A] p-10 min-w-[300px] max-w-[500px] min-h-[200px] flex items-center justify-center rounded-lg">
      {children}
    </div>
  );
}

export function Card2({ children }: CardProps): JSX.Element {
  return (
    <div className="cards-bg border-2 border-[#23283A] p-10 rounded-3xl w-full">
      {children}
    </div>
  );
}

interface StatusMessageProps {
  message: string;
  type: "error" | "success";
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  type,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000); // Message disappears after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const iconSrc =
    type === "error" ? "/assets/icons/problem.svg" : "/assets/icons/book.svg";

  return (
    <div
      className={`fixed top-5 right-5 p-3 rounded-md text-white flex items-center ${
        type === "error" ? "bg-[#E40686]" : "bg-[#5EE398]"
      } ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    >
      <div className="flex-shrink-0 mr-3">
        <Image src={iconSrc} alt="Icon" width={24} height={24} />
      </div>
      <div>{message}</div>
    </div>
  );
};
